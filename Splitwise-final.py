from datetime import datetime
import pandas as pd

class HouseholdSplitwiseInteractive:
    def __init__(self):
        self.user_map = {}
        self.balances = {}
        self.transactions = []  # List to store transaction history
        self.same_payer_for_all = False
        self.universal_payer = None

    def add_users(self):
        user_names = ["Gokul", "Navaneeth", "Abhishek", "Teja", "Harris"]
        print("Adding users:")
        for i, name in enumerate(user_names, start=1):
            self.user_map[str(i)] = name
            self.balances[name] = 0.0
            print(f"{i}. {name}")
        print("\nUsers added successfully.")

    def set_payer_policy(self):
        response = input("Do all transactions have the same payer? (Y/N): ").strip().lower()
        if response == 'y':
            self.same_payer_for_all = True
            payer_number = input("Who is the payer for all transactions? (Enter number 1-5): ")
            self.universal_payer = self.user_map[payer_number]

    def add_expense(self):
        if self.same_payer_for_all:
            paid_by = self.universal_payer
        else:
            paid_by_number = input("Who paid for this transaction? (Enter number 1-5): ")
            paid_by = self.user_map.get(paid_by_number, None)
            if not paid_by:
                print("Invalid user number. Please try again.")
                return True  # To allow retry

        amount = float(input("How much was the transaction? "))
        involved_users_numbers = input("Enter the numbers of users involved in this transaction (comma separated, e.g., 1,2,3,99 for all or Z to finish): ")

        if involved_users_numbers.strip() == '99':
            involved_users = list(self.user_map.values())
        elif involved_users_numbers.lower() == 'z':  # Special case to end input early
                return False
        else:
            involved_users_numbers = involved_users_numbers.split(',')
            involved_users = [self.user_map.get(num.strip()) for num in involved_users_numbers if num.strip() in self.user_map]

        if not involved_users:
            print("No valid users involved. Please try again.")
            return True  # To allow retry

        split_amount = amount / len(involved_users)
        transaction_details = {
            "paid_by": paid_by,
            "amount": amount,
            "involved_users": involved_users
        }
        self.transactions.append(transaction_details)

        for user in involved_users:
            if user == paid_by:
                if len(involved_users) > 1:
                    self.balances[user] += amount - split_amount
            else:
                self.balances[user] -= split_amount
        return True

    def summarize_transactions(self):
        summary = {}
        for transaction in self.transactions:
            paid_by = transaction["paid_by"]
            if paid_by not in summary:
                summary[paid_by] = {'total_paid': 0, 'shares': {user: 0 for user in self.user_map.values()}}
            summary[paid_by]['total_paid'] += transaction["amount"]
            split_amount = transaction["amount"] / len(transaction["involved_users"])
            for user in self.user_map.values():
                if user in transaction["involved_users"]:
                    if user != paid_by:
                        summary[paid_by]['shares'][user] += split_amount
                    else:
                        summary[paid_by]['shares'][user] += transaction["amount"] - split_amount
        return summary

    def export_to_excel(self, summary):
    # Create a DataFrame with the necessary columns
        columns = ['PaidBy', 'Amount'] + [user for user in self.user_map.values()]
        data_list = []

        # Fill the DataFrame
        for paid_by, details in summary.items():
            row = {user: 0 for user in self.user_map.values()}  # Initialize all users' shares to 0
            row.update({'PaidBy': paid_by, 'Amount': details['total_paid']})
            for user, share in details['shares'].items():
                row[user] = share  # Update the share for each user
            data_list.append(row)

        df = pd.DataFrame(data_list, columns=columns)

        # Format the DataFrame to have currency format in Amount and Shares
        df['Amount'] = df['Amount'].apply(lambda x: f"${x:.2f}")
        for user in self.user_map.values():
            df[user] = df[user].apply(lambda x: f"${x:.2f}")
            
        # Obtain the current date in DD_MM_YYYY format
        current_date = datetime.now().strftime("%d_%m_%Y")
        
        # Use the current date in the filename
        filename = f'final_transaction_summary_{current_date}.xlsx'

        # Save to an Excel file
        with pd.ExcelWriter(filename) as writer:
            for paid_by in summary:
                # Filter the data for each 'PaidBy'
                df_filtered = df[df['PaidBy'] == paid_by]
                df_filtered.to_excel(writer, sheet_name=paid_by, index=False)

    def run(self):
        self.add_users()
        self.set_payer_policy()
        while True:
            if not self.add_expense():
                break

        summary = self.summarize_transactions()
        self.export_to_excel(summary)

# Initialize and run the application
household_splitwise = HouseholdSplitwiseInteractive()
household_splitwise.run()
