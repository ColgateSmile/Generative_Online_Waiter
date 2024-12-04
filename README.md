## Generative_Online_Waiter
An interactive online waiter chatbot built with React and integrated with the OpenAI API, enabling users to order food and drinks from a predefined menu. The chatbot confirms orders, suggests drinks, and summarizes the total.


## **Features**
- Dynamic food ordering from a predefined menu.
- OpenAI API integration using the `gpt-3.5-turbo` or ` gpt-4o-realtime-preview-2024-10-01` model.
- Customizable menu for flexibility.
- Interactive chat interface with user and bot messaging.
- Handles errors gracefully and provides user feedback.


---- need to add real time voice commands https://platform.openai.com/docs/guides/realtime---


## **Technologies Used**
- **Frontend**: React
- **API Integration**: Axios
- **AI**: OpenAI GPT Models (`gpt-3.5-turbo` / ` gpt-4o-realtime-preview-2024-10-01`)
- **State Management**: React `useState`



## **Setup and Installation**
1. **Clone the Repository**:
   ```bash
   git clone (https://github.com/ColgateSmile/Generative_Online_Waiter.git)
   cd online-waiter-app
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add your OpenAI API key:
     ```env
     REACT_APP_OPENAI_API_KEY=your_actual_api_key
     ```

4. **Start the Development Server**:
   ```bash
   npm start
   ```

5. **Access the App**:
   - Open your browser and navigate to: `http://localhost:3000`.



## **How It Works**
1. Users interact with the chatbot by typing messages into the input box.
2. The chatbot:
   - Uses a predefined menu from `menu.js` to process orders.
   - Suggests drinks if no drink is included in the order.
   - Summarizes the total cost of the order.
3. OpenAI API dynamically generates responses for the chatbot, enhancing interaction.

---

## **File Structure**
```
online-waiter-app/
├── public/
├── src/
│   ├── components/
│   │   ├── ChatBox.jsx       # Main chatbot component
│   ├── data/
│   │   ├── menu.js           # Predefined menu items
│   ├── App.js                # Root application file
│   ├── index.js              # Entry point
├── .env                      # Environment variables
├── package.json              # Project configuration
```

---

## **Customization**
### **pre-determine Menu**
- Modify the menu in `src/data/menu.js`:
  ```javascript
  const menu = [
    { name: "Burger", price: 5.99 },
    { name: "Pizza", price: 7.99 },
    { name: "Soda", price: 1.99 },
    { name: "Water", price: 0.99 },
  ];
  export default menu;
  ```

### **AI Responses**
- Update the `systemMessage` in `ChatBox.jsx` to customize bot behavior.

---

## **Future Enhancements**
- Add user authentication.
- Integrate payment processing.
- Expand menu customization with categories.
- Add voice interaction support.
