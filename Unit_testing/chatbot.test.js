// Test for chatbot service

const chatBot = require("../CHATBOT_SERVICE/chatbot");
// This test was expecting to receive the string message response 
// from the API when stock_code=aapl.us which was $114.06 on 09/29/2020 at 12:41 pm
// Be aware the stock value might change day through day in market
// That's why the value on tobe() has to change eventually as well for testing purposes
// Otherwise it will fail
test("return stock value when user types command: /stock=aapl.us", () => {
    chatBot("/stock=aapl.us").then(res => {
        expect(res.message).toBe("AAPL.US quote is $114.06 per share")
    });
});