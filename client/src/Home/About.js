import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft, faQuoteRight } from '@fortawesome/free-solid-svg-icons';

import './About.css';

export default function About() {
  return (
    <div id="about-container">
      <h2 id="about-title">What is Camp?</h2>

      <div id="about-quote-container">
        <FontAwesomeIcon id="about-quote-opening-quotation" icon={faQuoteLeft} />
        <p id="about-quote"><i>
          No one says the word &apos;camp&apos; anymore. Even 90-year-old queens don’t say that. Even if we’re sitting under a Tiffany lampshade. Maybe even at the last meeting of the Rita Hayworth fan club. People don’t know what it is. To me, camp was a secret word that gay people used and Susan Sontag exposed it in a great, great way. But then it was done. Once the secret was out, it was over. I mean, what is camp today? Is there a movie out now that’s so bad it’s great? Maybe not, because everybody is in on it. It’s not accidental.
        </i></p>
        <FontAwesomeIcon id="about-quote-closing-quotation" icon={faQuoteRight} />
        <p id="about-quote-attribution">-John Waters</p>
      </div>

      <div id="about-body">
        <p>
          Camp is defined as &quot;something so outrageously artificial, affected, inappropriate, or out-of-date as to be considered amusing&quot;.
          The term originated in the early 20th century in regards to exaggerated or theatrical behavior.
          Later, in the early 70&apos;s, camp became popular in it&apos;s own right. Around that time American writer Susan Sontage also wrote her first published essay, &quot;Notes on Camp&quot;.
        </p>
        <p>
          Sontag was a famous essayist who covered topics ranging from film, literature, policitcs, and philosophy.
          She structured &quot;Notes on Camp&quot; in a series of numbered snippets of her thoughts on what made something camp, what the appeal of camp was, and what the future of camp might be.
        </p>
        <p>
          This site takes all of descriptions Sontag makes about what makes something camp, phrases them as simple yes or no questions, and calculates a score based off those answers. After going through and answering the questions, you can finally find out how campy the movies you love are, according to Susan Sontag at least.
        </p>
      </div>
    </div>
  );
}
