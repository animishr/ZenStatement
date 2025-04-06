import pandas as pd


def get_missing_transactions(file_path):

    # Ingest the transaction CSV file into a pandas Dataframe
    df = pd.read_csv(file_path)

    # Filter on rows where the 'Sub-Status' contains 'Not Found SysB'
    df = df[df["recon_sub_status"].str.contains("not found.*sysb", case=False)]

    # Select 'Order ID', 'Date' and 'Amount' columns
    df = df[["txn_ref_id", "sys_a_date", "sys_a_amount_attribute_1"]]
    df.rename(columns={"txn_ref_id": "order_id",
                        "sys_a_amount_attribute_1": "amount",
                        "sys_a_date": "date"}, 
                inplace=True)
    
    return df