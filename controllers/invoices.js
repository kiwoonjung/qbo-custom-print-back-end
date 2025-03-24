import axios from "axios";

/* READ */
export const getInvoice = async (req, res) => {
  const { accessToken, realmId, invoiceId } = req.query;
  try {
    // Make a request to the QuickBooks API
    // https://quickbooks.api.intuit.com
    // https://sandbox-quickbooks.api.intuit.com
    console.log("invoiceId", invoiceId);
    const response = await axios.get(
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/invoice/${invoiceId}/?minorversion=75`,
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
