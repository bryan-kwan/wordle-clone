import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) { //displays value passed down from props
  return (
    <button className="square">
      {props.letter}
    </button>
  );
}

class Board extends React.Component {
  render() {
    let letters = this.props.words;
    let word_length = letters[0].length
    let index = Array(word_length);
    for(let i = 0; i<word_length; i++) {
      index[i] = i;
    }

    return (
      <div className="board">
        {index.map(function(i){
          return <div className="word" key={i}>
            {index.map(function(j){
              return <Square letter={letters[i][j]} key={i + j}></Square>
            })} </div>}
        )}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      words: Array(5).fill(0).map(row => new Array(5).fill('')), //5 by 5 array filled with the letters for each word  
      colours: Array(5).fill(0).map(row => new Array(5).fill('w')), //5 by 5 array with the colours of each letter in each word: w for white, g for green, y for yellow
      used_words: Array(5).fill(''), //array with words already guessed
      game_won: false, //game status
      game_lost: false,
      guesses: 0, //how many guesses made
      word_index: 0, //index of user input
    };
    this.handleKeyDown = this.handleKeyDown.bind(this); //bind
  }
  componentDidMount(){
    window.addEventListener('keyPress', this.handleKeyDown.bind(this)); //keyboard listener
  }
  componentWillUnmount(){
    window.removeEventListener('keyPressed', this.handleKeyDown.bind(this)); //cleanup
  }
  handleKeyDown(event) {
    let words = this.state.words;
    let guesses = this.state.guesses;
    let word_index = this.state.word_index;
    let word = words[guesses].join("");
    let used_words = this.state.used_words;
    let colours = this.state.colours;
    if (guesses===5) {
      console.log("You lose");
      this.setState({game_lost: true});
    }
    if(event.keyCode>=65 & event.keyCode<=90) { //keyCodes for letters
      if(word_index<5) {
        words[guesses][word_index] = event.key;
        word_index+=1;
      }
    }
    if(event.keyCode===8) { //backspace
      if(word_index>0) {
        words[guesses][word_index-1] = '';
        word_index-=1;
      }
    }
    if(event.keyCode===13) { //enter
      if(word_index===5) { //if 5 letters inputted
        let result = check_if_word_exists(word); //check if guess is in the dictionary using an API, returns a Promise
        result.then(is_valid_word => {
          if (!is_valid_word) { //invalid input, not a word in the english dictionary
            console.log("Not a valid word");
          }
          else if (used_words.includes(word)) { //invalid input, word already used
            console.log("You already guessed that word");
          }
          else { //valid input
            guesses+=1;
            word_index=0;
            used_words.push(word);
            this.setState({words: words, guesses: guesses, word_index: word_index, used_words: used_words, colours: colours,});
          }
        });
      }
    }
    this.setState({words: words, guesses: guesses, word_index: word_index, used_words: used_words,colours: colours,});
  }

  render() {
    let status = this.state.game_won ? 'You win!' : '';
    let words = this.state.words;

    return (
      <div className="game" onKeyDown={this.handleKeyDown} tabIndex="0">
        <div className="status">{status}</div>
        <div><Board className="board" words={words} onKeyDown={this.handleKeyDown}></Board></div>
      </div>
      
    );
  }
}


ReactDOM.render(
  <Game />,
  document.getElementById('root')
);


function check_if_word_exists(word) {
  const url = "https://api.wordnik.com/v4/word.json/" + word + "/definitions?includeRelated=false&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";

  let result = fetch(url).then(response => {
    if (response.ok) {
      return true;
    } else if (response.status === 404) {
      return false;
    } else {
      return Promise.reject('API error: ' + response.status);
    }
  })
  .then(data => {return data})
  .catch(error => console.log('Error: ' + error));

  return result;
}
