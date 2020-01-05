class trieNode {
  constructor(value, word=null) {
    this.value = value;
    this.word = word;
    this.children = {};
  }
}

class Trie {
  constructor() {
    this.root = new trieNode('');
  }

  addWord(word, originalWord=null) {
    const characters = word.toLowerCase().split('');

    if (originalWord === null) {
      originalWord = word;
    }

    let currentNode = this.root;

    // iterate over each character of the given word
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];

      // if there is already a node for this character
      if (character in currentNode.children) {
        // if this is the last character
        if (i == characters.length - 1) {
          // mark the child as a word
          currentNode.children[character].word = originalWord;
          return;
        }
      } else {
        // create a new trieNode with the current characters value
        // mark it as a word if this is the last character
        currentNode.children[character] = new trieNode(
          character,
          i == characters.length - 1 ? originalWord : null
        );
      }

      // update the currentNode to be the child representing the current character
      currentNode = currentNode.children[character];
    }
  }

  getWords(prefix) {
    prefix = prefix.toLowerCase();

    let currentNode = this.root;

    // iterate over each character of the given prefix
    for (let i = 0; i < prefix.length; i++) {
      const character = prefix[i];

      if (character in currentNode.children) {
        currentNode = currentNode.children[character];
      } else {
        return new Set();
      }
    }

    // DFS starting at currentNode to get all possible words with the given prefix
    const words = new Set();
    function dfs(startingNode, word) {
      if (startingNode.word !== null) {
        words.add(startingNode.word);
      }

      // if there are no child nodes return
      if (Object.keys(startingNode.children).length == 0) {
        return;
      }

      for (let character of Object.keys(startingNode.children)) {
        dfs(startingNode.children[character], word + character);
      }
    }

    dfs(currentNode, prefix)
    return words;
  }
}

module.exports = Trie;
