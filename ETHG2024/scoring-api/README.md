# Scoring API ✅ - fully working
this is the backend layer that interacts with open AI and
MORPH blockchain, allowing our application to distribute
rewards to people contributing to the development of businesses

* ai_connectors.py - service for requesting the evaluation of the 
comments scores. There you may find the PROMPT, data transformations
* score_calculator.py - this module makes the final calculation of
how to distribute tokens. Harmonization, spam filter
* models.py - models used for data handling
* get_token_contract - utility function to simplify the interaction with
token contract deployed on MORPH
* get_manager_contract - utility function to simplify the interaction with
manager contract deployed on MORPH
* blockchain connector - set up of JSON-RPC provider,
function allowing to distribute pool rewards based on the calculated score

prerequisites: 
python 3.11

to run

create virtual environment
```bash
python -m venv venv
```

activate virtual environment
```bash
source venv/bin/activate
```

install dependencies
```bash
pip install -r requirements.txt
```

run server
```bash
fastapi dev main.py
```