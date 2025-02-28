/* READ */
export const getCompanyInfo = async (req, res) => {
  const { accessToken, realmId } = req.query;
  try {
    // Make a request to the QuickBooks API
    const response = await axios.post(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo?minorversion=75`,
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
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: error.message });
  }
};
