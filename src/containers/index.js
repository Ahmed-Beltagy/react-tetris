import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import propTypes from 'prop-types';

import style from './index.less';

import Matrix from '../components/matrix';
import Decorate from '../components/decorate';
import Number from '../components/number';
import Next from '../components/next';
import Music from '../components/music';
import Pause from '../components/pause';
import Point from '../components/point';
import Logo from '../components/logo';
import Keyboard from '../components/keyboard';
import Guide from '../components/guide';
import ThemeSwitcher from '../components/themeSwitcher'; // Import the switcher
import { transform, lastRecord, speeds, i18n, lan, ThemeLight, ThemeDark } from '../unit/const'; // Import theme constants
import { visibilityChangeEvent, isFocus } from '../unit/';
import states from '../control/states';
// Assuming actions are exported like this, adjust if necessary
import * as actions from '../actions';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      w: document.documentElement.clientWidth,
      h: document.documentElement.clientHeight,
    };
  }

  resize = () => { // Use arrow function for binding
    this.setState({
      w: document.documentElement.clientWidth,
      h: document.documentElement.clientHeight,
    });
  }

  componentDidMount() { // Changed from componentWillMount to componentDidMount for listeners
    window.addEventListener('resize', this.resize, true);
  componentDidMount() {
    if (visibilityChangeEvent) { // 将页面的焦点变换写入store
      document.addEventListener(visibilityChangeEvent, () => {
        states.focus(isFocus());
      }, false);
    }

    if (lastRecord) { // 读取记录
      if (lastRecord.cur && !lastRecord.pause) { // 拿到上一次游戏的状态, 如果在游戏中且没有暂停, 游戏继续
        const speedRun = this.props.speedRun;
        let timeout = speeds[speedRun - 1] / 2; // 继续时, 给予当前下落速度一半的停留时间
        // 停留时间不小于最快速的速度
        timeout = speedRun < speeds[speeds.length - 1] ? speeds[speeds.length - 1] : speedRun;
        states.auto(timeout);
      }
      if (!lastRecord.cur) {
        states.overStart();
      }
    } else {
      states.overStart();
    }
  }

  componentWillUnmount() { // Add cleanup for listeners
    window.removeEventListener('resize', this.resize, true);
    if (visibilityChangeEvent) {
      // Consider removing the visibility change listener here if added in componentDidMount
      // document.removeEventListener(visibilityChangeEvent, ...);
    }
  }

  render() {
    const {
      matrix,
      cur,
      next,
      pause: pauseState, // Rename to avoid conflict with component name
      music: musicState, // Rename to avoid conflict with component name
      points,
      max,
      speedRun,
      speedStart,
      startLines: startLinesProp, // Rename to avoid conflict
      clearLines: clearLinesProp, // Rename to avoid conflict
      reset,
      drop: dropState, // Rename to avoid conflict
      keyboard,
      theme, // Get theme from props
    } = this.props;

    let filling = 0;
    const size = (() => {
      const w = this.state.w;
      const h = this.state.h;
      const ratio = h / w;
      let scale;
      let css = {};
      if (ratio < 1.5) {
        scale = h / 960;
      } else {
        scale = w / 640;
        filling = (h - (960 * scale)) / scale / 3;
        css = {
          paddingTop: Math.floor(filling) + 42,
          paddingBottom: Math.floor(filling),
          marginTop: Math.floor(-480 - (filling * 1.5)),
        };
      }
      css[transform] = `scale(${scale})`;
      return css;
    })();

    // Determine the theme class based on the Redux state
    const themeClass = theme === ThemeDark ? style.themeDark : style.themeLight;
    // Or if using global classes: const themeClass = `theme-${theme}`;

    return (
      // Apply the theme class to the main container div
      <div
        className={`${style.app} ${themeClass}`} // Combine app style with theme style
        style={size}
      >
        <div className={classnames({ [style.rect]: true, [style.drop]: dropState })}>
          <Decorate />
          <div className={style.screen}>
            <div className={style.panel}>
              <Matrix
                matrix={matrix}
                cur={cur}
                reset={reset}
              />
              <Logo cur={!!cur} reset={reset} />
              <div className={style.state}>
                <Point cur={!!cur} point={points} max={max} />
                <p>{ cur ? i18n.cleans[lan] : i18n.startLine[lan] }</p>
                {/* Use clearLines count from state */}
                <Number number={cur ? clearLinesProp : startLinesProp} />
                <p>{i18n.level[lan]}</p>
                <Number
                  number={cur ? speedRun : speedStart}
                  length={1}
                />
                <p>{i18n.next[lan]}</p>
                <Next data={next} />
                <div className={style.bottom}>
                  <Music data={musicState} />
                  <Pause data={pauseState} />
                  <Number time />
                </div>
                 {/* Render the theme switcher */}
                 <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>
        <Keyboard filling={filling} keyboard={keyboard} />
        {/* <Guide /> */} {/* Conditionally render Guide or remove if not needed */}
      </div>
    );
  }
}

App.propTypes = {
  music: propTypes.bool.isRequired,
  pause: propTypes.bool.isRequired,
  matrix: propTypes.object.isRequired,
  next: propTypes.string.isRequired,
  cur: propTypes.object,
  dispatch: propTypes.func.isRequired,
  speedStart: propTypes.number.isRequired,
  speedRun: propTypes.number.isRequired,
  startLines: propTypes.number.isRequired,
  clearLines: propTypes.number.isRequired,
  points: propTypes.number.isRequired,
  max: propTypes.number.isRequired,
  reset: propTypes.bool.isRequired,
  drop: propTypes.bool.isRequired, // Renamed to dropState in render
  keyboard: propTypes.object.isRequired,
  theme: propTypes.string.isRequired, // Add theme prop type
};

const mapStateToProps = (state) => ({
  pause: state.get('pause'), // Mapped as pause, used as pauseState in render
  music: state.get('music'), // Mapped as music, used as musicState in render
  matrix: state.get('matrix'),
  next: state.get('next'),
  cur: state.get('cur'),
  speedStart: state.get('speedStart'),
  speedRun: state.get('speedRun'),
  startLines: state.get('startLines'),
  clearLines: state.get('clearLines'),
  points: state.get('points'),
  max: state.get('max'),
  reset: state.get('reset'),
  drop: state.get('drop'), // Mapped as drop, used as dropState in render
  keyboard: state.get('keyboard'),
  theme: state.get('theme'), // Map theme state to props
});

export default connect(mapStateToProps)(App);
