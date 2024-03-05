# Household Splitwise Interactive

The Household Splitwise Interactive is a Python-based command-line application designed to simplify tracking and splitting expenses among housemates or any group of people. This tool allows users to input transactions, define who paid and who owes, and then exports a detailed summary to an Excel file.

## Setup

### Requirements

- Python 3.x
- pandas library
- openpyxl library (for writing to Excel)

### Installation

1. Ensure Python 3 is installed on your system. You can download it from [python.org](https://www.python.org/downloads/).

2. Install required Python packages using pip:


## How to Run

1. Save the script to a file, for example, `splitwise.py`.
2. Open your terminal or command prompt.
3. Navigate to the directory where `splitwise.py` is saved.
4. Run the script using Python:


## Features and Functions

### `__init__(self)`

Initializes the instance with empty structures for user mapping, balances, and transactions. Also, sets the default payment policy.

### `add_users(self)`

Pre-populates the application with a list of user names. These names are assigned unique identifiers and initialized with a balance of 0. This method prints out each user's name and identifier as they are added.

### `set_payer_policy(self)`

Asks the user whether all transactions have the same payer. If the response is yes (`'y'`), it prompts for the identifier of the universal payer and sets this user as the payer for all transactions.

### `add_expense(self)`

Handles the input of transaction details. Depending on the payer policy, it either uses the universal payer or asks who paid for the current transaction. It then records the amount, who was involved (with options for selecting all users or specific ones), and updates the balances accordingly. The user can exit the transaction input loop by entering `'Z'` when prompted for involved users.

### `summarize_transactions(self)`

Aggregates transactions to summarize the total amount paid by each user and the shares owed by or to them. It builds a detailed summary that maps each payer to their respective transactions and the involved users' shares.

### `export_to_excel(self, summary)`

Takes the transaction summary and exports it to an Excel file named `final_transaction_summary_DD_MM_YYYY.xlsx`, where `DD_MM_YYYY` is the current date. Each payer has a dedicated sheet in the workbook, listing their transactions and the corresponding shares for involved users.

### `run(self)`

The main driver of the application. It sequentially calls methods to add users, set the payer policy, input transactions, summarize them, and then export the summary to Excel.

## Example Usage

After running the script, the application will guide you through the process:

1. Confirm whether there's a single payer for all transactions.
2. Input transaction details as prompted.
3. Enter `'Z'` to finish transaction input.
4. The application will then generate and open an Excel file with the summary.

This tool simplifies managing shared expenses, making it easy to see who owes what to whom at a glance.
