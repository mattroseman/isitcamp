/*
 * getMaxPossiblePoints takes a JSON object that is a list of questions with points associated with each possible answer.
 * Each answer points to a next question, using a depth first search, it determines the maximum possible points you can get.
 */
let questionMaxPoints = {}
function getMaxPossiblePoints(startingQuestion=firstQuestion) {
  const question = questions[startingQuestion]

  let yesPoints = question['options']['yes']['points'];
  // if there is another question following the yes option, recursively calculate it's maximum points
  if ('next_question' in question['options']['yes']) {
    let nextQuestion = question['options']['yes']['next_question'];
    if (nextQuestion in questionMaxPoints) {
      yesPoints += questionMaxPoints[nextQuestion];
    } else {
      yesPoints += getMaxPossiblePoints(question['options']['yes']['next_question'])
    }
  }

  let noPoints = question['options']['no']['points'];
  // if there is another question following the no option, recursively calculate it's maximum points
  if ('next_question' in question['options']['no']) {
    let nextQuestion = question['options']['no']['next_question'];
    if (nextQuestion in questionMaxPoints) {
      noPoints += questionMaxPoints[nextQuestion];
    } else {
      noPoints += getMaxPossiblePoints(question['options']['no']['next_question'])
    }
  }

  const maxPoints = Math.max(yesPoints, noPoints);

  questionMaxPoints[startingQuestion] = maxPoints;

  return maxPoints;
}

export const questions = { 
  'version': 2,
  '1': { 
    'question': 'Does this movie have an apparent style?',
    'options': { 
      'yes': { 
        'next_question': '2',
        'points': 2
      },
      'no': { 
        'next_question': '2',
        'points': 0
      }
    }
  },
  '2': { 
    'question': 'Is there some political or moral message the movie tries to empart through its content? In other words, is it preachy?',
    'options': { 
      'yes': { 
        'next_question': '5',
        'points': 0
      },
      'no': { 
        'next_question': '5',
        'points': 1
      }
    }
  },
  '5': { 
    'question': 'Does the movie take itself seriously. Does it avoid anything silly or extravagant?',
    'options': { 
      'yes': { 
        'next_question': '23',
        'points': 0
      },
      'no': { 
        'next_question': '6',
        'points': 1
      }
    }
  },
  '23': { 
    'question': 'Did this film succeed in its serious intentions?',
    'options': { 
      'yes': { 
        'next_question': '6',
        'points': 0
      },
      'no': { 
        'next_question': '26',
        'points': 1,
        'quantifier': 'naive'
      }
    }
  },
  '26': { 
    'question': 'Does the film fail in its serious intentions because it went too far, or was too much? Did it overstep?',
    'options': { 
      'yes': { 
        'next_question': '6',
        'points': 1,
        'quantifier': 'naive'
      },
      'no': { 
        'next_question': '6',
        'points': 0
      }
    }
  },
  '6': { 
    'question': 'If you look at this movie seriously, is it bad?',
    'options': { 
      'yes': { 
        'next_question': '7',
        'points': 2
      },
      'no': { 
        'next_question': '7',
        'points': 0
      }
    }
  },
  '7': { 
    'question': 'Could the events of this movie happen in the real world?',
    'options': { 
      'yes': { 
        'next_question': '8',
        'points': 0
      },
      'no': { 
        'next_question': '8',
        'points': 1
      }
    }
  },
  '8': { 
    'question': 'Do characters or elements of the movie seem off to an exaggerated degree? Something or someone you wouldn\'t expect in that role.',
    'options': { 
      'yes': { 
        'next_question': '9a',
        'points': 1
      },
      'no': { 
        'next_question': '9a',
        'points': 0
      }
    }
  },
  '9a': { 
    'question': 'Are there overly androgynous or sexless characters?',
    'options': { 
      'yes': { 
        'next_question': '9b',
        'points': 1
      },
      'no': { 
        'next_question': '9b',
        'points': 0
      }
    }
  },
  '9b': { 
    'question': 'Are there overexaggerated sexual characters?',
    'options': { 
      'yes': { 
        'next_question': '10',
        'points': 1
      },
      'no': { 
        'next_question': '10',
        'points': 0
      }
    }
  },
  '10': { 
    'question': 'Is it obvious characters are playing a roll? Maybe through 4th wall breaks, or small winks at the audience letting them in on the joke?',
    'options': { 
      'yes': { 
        'next_question': '11',
        'points': 1
      },
      'no': { 
        'next_question': '11',
        'points': 0
      }
    }
  },
  '11': { 
    'question': 'Do characters stick to traditional gender stereotypes? Men are all masculine, and women only feminine.',
    'options': { 
      'yes': { 
        'next_question': '16',
        'points': 0
      },
      'no': { 
        'next_question': '16',
        'points': 1
      }
    }
  },
  '16': { 
    'question': 'Does there seem to be deeper meaning in the movie through metaphors? For example, A sleigh thrown into a furnace representing the lost innocence of childhood.',
    'options': { 
      'yes': { 
        'next_question': '24',
        'points': 0
      },
      'no': { 
        'next_question': '24',
        'points': 1
      }
    }
  },
  // skipping 17 for now, since it seems like a vague question
  '17': { 
    'question': 'Does it seem like there\'s a double meaning of things in the film, not like metaphor, but like an inside joke?',
    'options': { 
      'yes': { 
        'next_question': '24',
        'points': 1
      },
      'no': { 
        'next_question': '24',
        'points': 0
      }
    }
  },
  '24': { 
    'question': 'Is this an ambitious film for the director? Have they attempted something outlandish and fantastical in making this film?',
    'options': { 
      'yes': { 
        'next_question': '27',
        'points': 2
      },
      'no': { 
        'next_question': '27',
        'points': 0
      }
    }
  },
  '27': { 
    'question': 'Does there appear to be passion behind the making of this film? Does the extravagance in the film seem to follow a consistent vision?',
    'options': { 
      'yes': { 
        'next_question': '28',
        'points': 2
      },
      'no': { 
        'next_question': '28',
        'points': 0
      }
    }
  },
  '28': { 
    'question': 'Is the film extraordinary in a visual sense? Not in a sense of effort put in, but in theatricality and glamour?',
    'options': { 
      'yes': { 
        'next_question': '29',
        'points': 1
      },
      'no': { 
        'next_question': '29',
        'points': 0
      }
    }
  },
  '29': { 
    'question': 'Does the film feel pretentious?',
    'options': { 
      'yes': { 
        'next_question': '30a',
        'points': 0
      },
      'no': { 
        'next_question': '30a',
        'points': 1
      }
    }
  },
  '30a': { 
    'question': 'Is this a recent film?',
    'options': { 
      'yes': { 
        'next_question': '32a',
        'points': 0
      },
      'no': { 
        'next_question': '30b',
        'points': 0
      }
    }
  },
  '30b': { 
    'question': 'Has the film aged well? Does the film feel timeless, in the sense that it\'s still relatable?',
    'options': { 
      'yes': { 
        'next_question': '32a',
        'points': 0
      },
      'no': { 
        'next_question': '31',
        'points': 1
      }
    }
  },
  '31': { 
    'question': 'Does the film make you nostalgic, especially for something once considered banal?',
    'options': { 
      'yes': { 
        'next_question': '32a',
        'points': 1
      },
      'no': { 
        'next_question': '32a',
        'points': 0
      }
    }
  },
  '32a': { 
    'question': 'Are actors playing themselves?',
    'options': { 
      'yes': { 
        'next_question': '32b',
        'points': 1
      },
      'no': { 
        'next_question': '32b',
        'points': 0
      }
    }
  },
  '32b': { 
    'question': 'Do any of the characters appear in other unconnected movies? Maybe with a different names and back stories, but essentially the same character.',
    'options': { 
      'yes': { 
        'next_question': '33',
        'points': 1
      },
      'no': { 
        'next_question': '33',
        'points': 0
      }
    }
  },
  '33': { 
    'question': 'Is there a lack of character development? Are characters one very intense thing, unchanging throughout the film?',
    'options': { 
      'yes': { 
        'next_question': '41',
        'points': 1
      },
      'no': { 
        'next_question': '41',
        'points': 0
      }
    }
  },
  '41': { 
    'question': 'Ignoring the director\'s intentions, are frivolous moments in the film taken seriously or serious moments taken frivolously?',
    'options': { 
      'yes': { 
        'next_question': '48',
        'points': 1
      },
      'no': { 
        'next_question': '48',
        'points': 0
      }
    }
  },
  '48': { 
    'question': 'Is the film vulgar?',
    'options': { 
      'yes': { 
        'next_question': '58',
        'points': 1
      },
      'no': { 
        'next_question': '58',
        'points': 0
      }
    }
  },
  '58': { 
    'question': 'Is it good because it is awful?',
    'options': { 
      'yes': { 
        'points': 3
      },
      'no': { 
        'points': 0
      }
    }
  }
};

export const firstQuestion = '1';
export const maxPossiblePoints = getMaxPossiblePoints();
