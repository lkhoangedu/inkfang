# Generate an Inkfang practice list

Copy one prompt into your own chatbot. Replace the three placeholders, review its output, then paste the JSON into + My lists. Inkfang does not contact a chatbot.

## Vocabulary

```text
Create a practice list for Inkfang, an English-learning game.
Topic: [REPLACE WITH YOUR TOPIC]
Learner level: [REPLACE WITH AGE / ENGLISH LEVEL]
Number of items: [REPLACE WITH A NUMBER BETWEEN 2 AND 500]

Return ONLY one valid JSON array. No introduction, explanations, Markdown, comments, or trailing commas. Use double quotes. Each item must use the schema below. Give every item a different answer.

Create vocabulary questions with short, accurate English clues. Use mode "vocabulary". Each prompt must be 1–120 characters, appropriate to the learner level, and must not reveal the answer. Avoid ambiguous clues, or explicitly list other reasonable answers in acceptedAnswers. Do not invent synonyms that fail to fit the clue. Use an empty array if there are no alternatives.
Use level 1 for beginner, 2 for elementary, or 3 for challenge. Answers and acceptedAnswers must be English letters only, uppercase, 1–24 letters each. Remove spaces, hyphens and apostrophes from answers (NEW YORK becomes NEWYORK). Keep normal readable text in prompt.

Example structure:
[{"mode":"vocabulary","level":1,"prompt":"A pet that says meow.","answer":"CAT","acceptedAnswers":[]},{"mode":"vocabulary","level":2,"prompt":"The season after summer.","answer":"AUTUMN","acceptedAnswers":["FALL"]}]

Generate the requested list now.
```

## Names and places

```text
Create a practice list for Inkfang, an English-learning game.
Topic: [REPLACE WITH YOUR TOPIC]
Learner level: [REPLACE WITH AGE / ENGLISH LEVEL]
Number of items: [REPLACE WITH A NUMBER BETWEEN 2 AND 500]

Return ONLY one valid JSON array. No introduction, explanations, Markdown, comments, or trailing commas. Use double quotes. Each item must use the schema below. Give every item a different answer.

Create personal names and/or place names for spelling practice. Use mode "spelling". prompt should show the name/place in readable English. answer is its uppercase spelling with spaces, hyphens and apostrophes removed. Use an empty acceptedAnswers array unless an equally valid spelling is intentional.
Use level 1 for beginner, 2 for elementary, or 3 for challenge. Answers and acceptedAnswers must be English letters only, uppercase, 1–24 letters each. Remove spaces, hyphens and apostrophes from answers (NEW YORK becomes NEWYORK). Keep normal readable text in prompt.

Example structure:
[{"mode":"spelling","level":1,"prompt":"Paris","answer":"PARIS","acceptedAnswers":[]},{"mode":"spelling","level":2,"prompt":"New York","answer":"NEWYORK","acceptedAnswers":[]}]

Generate the requested list now.
```

## Numbers

```text
Create a practice list for Inkfang, an English-learning game.
Topic: [REPLACE WITH YOUR TOPIC]
Learner level: [REPLACE WITH AGE / ENGLISH LEVEL]
Number of items: [REPLACE WITH A NUMBER BETWEEN 2 AND 500]

Return ONLY one valid JSON array. No introduction, explanations, Markdown, comments, or trailing commas. Use double quotes. Each item must use the schema below. Give every item a different answer.

Create single whole-number targets from 0 through 1000, limited to my requested range/topic. No PINs, phone numbers, decimals, negatives, leading zeroes or strings of several answers. Use mode "numbers". answer must be a decimal digit STRING. prompt must be that same number written in English words (the game also regenerates this for accuracy). Use level 1 for 0–20, 2 for 21–100, and 3 for 101–1000. Do not use acceptedAnswers for numbers.

Example structure:
[{"mode":"numbers","level":2,"prompt":"ninety-eight","answer":"98"},{"mode":"numbers","level":3,"prompt":"one hundred and six","answer":"106"}]

Generate the requested list now.
```
