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
    if (originalWord === null) {
      originalWord = word;
    }
    word = word.toLowerCase();

    let currentNode = this.root;

    // iterate over each character of the given word
    for (let i = 0; i < word.length; i++) {
      const character = word[i];

      // check to see if there is a child of character
      if (character in currentNode.children) {
        const edgeLabel = currentNode.children[character].value;

        // if edgeLabel equals what's left of the word, set that node as isWord
        if (edgeLabel === word.substr(i)) {
          currentNode.children[character].isWord = true;

          return;
        }

        // if what's left of the word is a prefix of the edgeLabel
        if(word.substr(i) === edgeLabel.substr(0, word.substr(i).length)) {
          // insert a new node between currentNode and this child
          const newNode = new trieNode(word.substr(i), originalWord);
          currentNode.children[character].value = edgeLabel.substr(word.substr(i).length);
          newNode.children[edgeLabel[word.substr(i).length]] = currentNode.children[character];
          currentNode.children[character] = newNode;

          return;
        }

        // if edgeLabel is a prefix of what's left of the word
        if (edgeLabel === word.substr(i, edgeLabel.length)) {
          // increment i so the edgeLabel that matches word is taken off 
          i += edgeLabel.length - 1;
          currentNode = currentNode.children[character];
        } else {
          // if the edgeLabel and what's left of the word share a common prefix
          let j = 0;
          while (j < word.substr(i).length && j < edgeLabel.length && word.substr(i)[j] === edgeLabel[j]) {
            j += 1;
          }
          const commonPrefix = edgeLabel.substr(0, j);

          const newNode = new trieNode(commonPrefix);
          newNode.children[edgeLabel[j]] = currentNode.children[character]
          currentNode.children[character] = newNode;
          newNode.children[edgeLabel[j]].value = edgeLabel.substr(j);
          newNode.children[word[i + j]] = new trieNode(word.substr(i + j), originalWord);

          return;
        }
      } else {
        // make a new node that's a word and has edge label of current and remaining characters
        const newNode = new trieNode(word.substr(i), originalWord);
        currentNode.children[character] = newNode;

        return;
      }
    }
  }

  getWords(prefix) {
    prefix = prefix.toLowerCase();

    let currentNode = this.root;

    // iterate over each character of the given prefix
    for (let i = 0; i < prefix.length; i++) {
      const character = prefix[i];

      if (character in currentNode.children) {
        i += currentNode.children[character].value.length - 1;
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
