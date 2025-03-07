import axios from "axios";

/* READ */
export const getInvoice = async (req, res) => {
  const { accessToken, realmId } = req.query;
  try {
    // Make a request to the QuickBooks API
    // https://quickbooks.api.intuit.com

    const response = await axios.get(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${process.env.COMPANY_ID}/invoice/15674/?minorversion=75`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );
    // Send the response back to the Chrome extension
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching a invoice:", error);
    res.status(500).json({ message: error.message });
  }
};
