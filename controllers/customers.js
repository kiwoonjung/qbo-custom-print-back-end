/* READ */
export const getCustomer = async (req, res) => {
  const { accessToken, realmId } = req.query;
  try {
    const response = await axios.get(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/customer/${customerId}?minorversion=40`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching the customer", error);
    res.status(500).json({ message: error.message });
  }
};
