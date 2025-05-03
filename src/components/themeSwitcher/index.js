import React from 'react';                                                                                                                                                                    
import { connect } from 'react-redux';                                                                                                                                                        
import propTypes from 'prop-types';                                                                                                                                                           
import { ThemeLight, ThemeDark } from '../../unit/const'; // Adjust path if consts are elsewhere                                                                                              
import { setTheme } from '../../actions'; // Assuming setTheme action creator exists                                                                                                          
import style from './index.less';                                                                                                                                                             
                                                                                                                                                                                              
class ThemeSwitcher extends React.Component {                                                                                                                                                 
  constructor(props) {                                                                                                                                                                        
    super(props);                                                                                                                                                                             
    // Bind 'this' for the toggleTheme method                                                                                                                                                 
    this.toggleTheme = this.toggleTheme.bind(this);                                                                                                                                           
  }                                                                                                                                                                                           
                                                                                                                                                                                              
  toggleTheme() { // Standard class method syntax                                                                                                                                             
    const nextTheme = this.props.currentTheme === ThemeLight ? ThemeDark : ThemeLight;                                                                                                        
    this.props.setTheme(nextTheme);                                                                                                                                                           
  }                                                                                                                                                                                           
                                                                                                                                                                                              
  render() {                                                                                                                                                                                  
    const isDarkMode = this.props.currentTheme === ThemeDark;                                                                                                                                 
    return (                                                                                                                                                                                  
      <button                                                                                                                                                                                 
        type="button" // Explicitly set button type                                                                                                                                           
        onClick={this.toggleTheme}                                                                                                                                                            
        className={style.themeButton}                                                                                                                                                         
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}                                                                                                                   
      >                                                                                                                                                                                       
        {isDarkMode ? '☀️' : '🌙'} {/* Example icons: Sun for light, Moon for dark */}                                                                                                         
      </button>                                                                                                                                                                               
    );                                                                                                                                                                                        
  }                                                                                                                                                                                           
}                                                                                                                                                                                             
                                                                                                                                                                                              
ThemeSwitcher.propTypes = {                                                                                                                                                                   
  currentTheme: propTypes.string.isRequired,                                                                                                                                                  
  setTheme: propTypes.func.isRequired,                                                                                                                                                        
};                                                                                                                                                                                            
                                                                                                                                                                                              
const mapStateToProps = (state) => ({                                                                                                                                                         
  // Ensure you are accessing the theme state correctly based on your reducer structure                                                                                                       
  currentTheme: state.get('theme'), // Assuming state is an Immutable Map and theme is a top-level key                                                                                        
});                                                                                                                                                                                           
                                                                                                                                                                                              
const mapDispatchToProps = (dispatch) => ({                                                                                                                                                   
  setTheme: (theme) => dispatch(setTheme(theme)), // Dispatch the setTheme action                                                                                                             
});                                                                                                                                                                                           
                                                                                                                                                                                              
export default connect(mapStateToProps, mapDispatchToProps)(ThemeSwitcher); 
