import React from 'react';
import immutable, { List } from 'immutable';
import classnames from 'classnames';
import propTypes from 'prop-types';
import style from './index.less';
import unit, { isClear } from '../../unit/';
import { fillLine, blankLine } from '../../unit/const';
import states from '../../control/states';

const t = setTimeout;

export default class Matrix extends React.Component {
  constructor() {
    super();
    this.state = {
      clearLines: false,
      animateColor: 2,
      isOver: false,
      overState: null,
    };
  }
  componentWillReceiveProps(nextProps = {}) {
    const clears = isClear(nextProps.matrix);
    const overs = nextProps.reset;
    this.setState({
      clearLines: clears,
      isOver: overs,
    });
    if (clears && !this.state.clearLines) {
      this.clearAnimate(clears);
    }
    if (!clears && overs && !this.state.isOver) {
      this.over(nextProps);
    }
  }
  shouldComponentUpdate(nextProps = {}) { // 使用Immutable 比较两个List 是否相等
    const props = this.props;
    // Add check for ghost piece prop if it were passed down, but here we calculate it internally
    return !(
      immutable.is(nextProps.matrix, props.matrix) &&
      immutable.is(
        (nextProps.cur && nextProps.cur.shape),
        (props.cur && props.cur.shape)
      ) &&
      immutable.is(
        (nextProps.cur && nextProps.cur.xy),
        (props.cur && props.cur.xy)
      )
    ) || this.state.clearLines
    || this.state.isOver; // Re-render if game over state changes
  }

  getResult(props = this.props) {
    const cur = props.cur;
    const matrix = props.matrix; // Original matrix from props
    let M = matrix; // Create a mutable copy for rendering changes
    const ghostCoordsToVerify = []; // Store coords where ghost should be drawn - DECLARE HERE

    const clearLines = this.state.clearLines;

    // Draw clear lines animation
    if (clearLines) {
      const animateColor = this.state.animateColor;
      clearLines.forEach((index) => {
        // Use a temporary list for the cleared line animation color
        const line = List([
          animateColor, animateColor, animateColor, animateColor, animateColor,
          animateColor, animateColor, animateColor, animateColor, animateColor,
        ]);
        M = M.set(index, line); // Update the rendering matrix M
      });
    } else if (cur) { // Only calculate and draw if there's a current piece
      const shape = cur.shape;
      const xy = cur.xy;

      // --- Ghost Piece Logic ---
      // Calculate the ghost piece's final landing position [Y, X]
      const ghostXY = unit.calculateGhostPosition(cur, matrix); // Use original matrix for calculation
      // Declaration moved to function scope

      // --- Draw Ghost Piece Logic ---
      // Put the position check back: Only draw if ghost position != current position
      if (ghostXY && !ghostXY.equals(xy)) {
        // console.log('Ghost Position:', ghostXY.toJS(), 'Current Position:', xy.toJS()); // Log positions - REMOVED
        const ghostY = ghostXY.get(0); // Row
        const ghostX = ghostXY.get(1); // Column

        // Iterate through the piece's shape to draw the ghost
        shape.forEach((m, k1) => { // k1 = relative row offset
          m.forEach((n, k2) => { // k2 = relative col offset
            if (n === 1) { // If this is a block of the piece
              const targetY = ghostY + k1; // Ghost block's absolute row
              const targetX = ghostX + k2; // Ghost block's absolute column

              // Check bounds (Y must be >= 0) and if the cell in the rendering matrix M is empty (0)
              const isYValid = targetY >= 0 && targetY < 20;
              const isXValid = targetX >= 0 && targetX < 10;
              // Check the RENDERING matrix M, ensuring the cell value is exactly 0 (empty)
              const cellValue = M.getIn([targetY, targetX]);
              const isEmpty = cellValue === 0;

              if (isYValid && isXValid && isEmpty) {
                // console.log(`  Attempting to draw ghost at [${targetY}, ${targetX}]`); // Log drawing attempt - REMOVED
                // Draw the ghost block onto M using value 3
                M = M.setIn([targetY, targetX], 3);
                ghostCoordsToVerify.push([targetY, targetX]); // Store coord for later verification
              } else {
                // Log why it didn't draw (optional, but can be helpful)
                // console.log(`  Skipping ghost at [${targetY}, ${targetX}]: YValid=${isYValid}, XValid=${isXValid}, Empty=${isEmpty}, Value=${cellValue}`);
              }
            }
          });
        });
      } else if (ghostXY) {
         // console.log('Ghost position equals current position, not drawing ghost.'); // Log skipped draw - REMOVED
      } else {
         // console.log('No valid ghost position calculated.'); // Log no ghost calc - REMOVED
      }
      // --- End Ghost Piece Logic ---

      // --- Draw Actual Piece Logic ---
      // Iterate through the piece's shape again to draw the actual piece
      // This runs *after* the ghost logic, so it overwrites ghost blocks correctly
      shape.forEach((m, k1) => (
        m.forEach((n, k2) => {
          if (n === 1) { // If this is a block of the piece
            const currentY = xy.get(0) + k1; // Actual block's absolute row
            const currentX = xy.get(1) + k2; // Actual block's absolute column
            // Check bounds (Y can be negative initially, but only draw if within grid height)
            if (currentY >= 0 && currentY < 20 && currentX >= 0 && currentX < 10) {
              // Draw the actual piece block onto M using value 1
              M = M.setIn([currentY, currentX], 1);
            }
          }
        })
      ));
      // --- End Actual Piece Logic ---
    }

    // --- Final Verification Log --- REMOVED
    // if (ghostCoordsToVerify.length > 0) {
    //   console.log('Verifying final matrix M values at ghost coordinates:');
    //   ghostCoordsToVerify.forEach(([y, x]) => {
    //     console.log(`  Value at [${y}, ${x}]:`, M.getIn([y, x]));
    //   });
    // }
    // --- End Final Verification Log ---


    // Return the final matrix M containing locked blocks, ghost blocks, and the active piece
    return M;
  }

  clearAnimate() {
    const anima = (callback) => {
      t(() => {
        this.setState({
          animateColor: 0, // Blink off
        });
        t(() => {
          this.setState({
            animateColor: 2, // Blink on (using locked piece color)
          });
          if (typeof callback === 'function') {
            callback();
          }
        }, 100);
      }, 100);
    };
    // Chain animations for blinking effect
    anima(() => {
      anima(() => {
        t(() => {
          // After animation, call the state update to clear lines
          states.clearLines(this.props.matrix, this.state.clearLines);
        }, 100);
      });
    });
  }

  // Game Over animation logic
  over(nextProps) {
    let overState = this.getResult(nextProps); // Get the final state before animation
    this.setState({
      overState, // Store it for the animation render
    });

    const exLine = (index) => {
      if (index <= 19) { // Fill lines from bottom up
        overState = overState.set(19 - index, List(fillLine));
      } else if (index >= 20 && index <= 39) { // Clear lines from bottom up
        overState = overState.set(index - 20, List(blankLine));
      } else { // Animation finished
        states.overEnd(); // Trigger game reset state
        return;
      }
      // Update the state to re-render the animation frame
      this.setState({
        overState,
      });
    };

    // Schedule the animation steps
    for (let i = 0; i <= 40; i++) {
      t(exLine.bind(null, i), 40 * (i + 1));
    }
  }

  render() {
    let matrix;
    // Use the animated overState if game is over, otherwise use the calculated result
    if (this.state.isOver && this.state.overState) {
      matrix = this.state.overState;
    } else {
      matrix = this.getResult();
    }

    // Render the matrix grid
    return (
      <div className={style.matrix}>{
          matrix.map((p, k1) => (<p key={k1}>
            {
              p.map((e, k2) => <b
                className={classnames({
                  // Apply classes based on the cell value in the final matrix M
                  [style.c]: e === 1, // Use style mapping for active piece
                  [style.d]: e === 2, // Use style mapping for locked pieces
                  [style.g]: e === 3, // Use style mapping for ghost piece
                  // Cells with 0 will have no class (empty)
                })}
                key={k2}
              />)
            }
          </p>))
      }
      </div>
    );
  }
}

Matrix.propTypes = {
  matrix: propTypes.object.isRequired, // Should be an Immutable List
  cur: propTypes.object, // Should be an Immutable Map (Block instance) or null
  reset: propTypes.bool.isRequired,
};
