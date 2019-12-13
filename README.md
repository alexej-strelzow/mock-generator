# Mock Generator

Hits configured REST-Endpoints (see config folder) and generates ***typed*** fixture files (see fixtures folder)
which can then be used to develop the frontend in mock-mode (e.g. Angular mock-service returns those fixtures).

## Run

- Linux or MacOSx: `npm run start`
- Windows: `npm run start:win`

## Project Structure

- config: contains the REST-Endpoints + metadata
- fixtures: the responses of the REST-Endpoints as typed or untyped fixture
- interfaces: interfaces/models/contracts of http-responses
- lib: compiled TypeScript code
- logs: log file (can be enabled/disabled: see FILE_LOGGING in index.ts)
- src: the source code

## Approach

### Fetch responses

Iterate over defined endpoints (1 entry per endpoint) and fetch data
```
{
  "endpoints": {
    "opentdb": {
      "url": "https://opentdb.com/api.php?amount=10&category=22&difficulty=hard&type=multiple",
      "fixtureFile": "quiz",
      "interface": "Quiz"
    },
    ...
  }
}
```

### Create typed fixtures or JSON fixtures

If interface (= model or contract) is defined then generate a TypeScript file (`<fixtureFile>.fixture.ts`).

E.g.:
```
 // auto-generated file - do not change manually
import { Quiz } from './../interfaces/quiz.model';

export default (): Quiz => {
  return {
    "response_code": 0,
    "results": [
      {
        "category": "Geography",
        "type": "multiple",
        "difficulty": "hard",
        "question": "What country is not a part of Scandinavia?",
        "correct_answer": "Finland",
        "incorrect_answers": [
          "Norway",
          "Sweden",
          "Denmark"
        ]
      },
      ...
    ]
  }
};
```

If no interface is defined -> save the response as JSON file (`<fixtureFile>.fixture.json`).

## Support different environment

By declaring the environment variable `NODE_ENV` you can load a different configuration.
E.g. `NODE_ENV = "env"` will load  `config/env.json`, hence different endpoints.