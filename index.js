const typingForm = document.querySelector(".typing-form");

const chatList = document.querySelector(".chat-list");

const suggestions = document.querySelectorAll(".suggestion-list .suggestion")

const toggleThemeButton = document.querySelector("#toggle-theme-button");

const deleteChat = document.querySelector("#delete_chat");


let userMessage = null;

// API configuration -->>

const API_KEY = "AIzaSyCey25cVHUwGZ1Gr7Y8yz1g_0-sxiaZdS0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;


const loadLocalStorage = () => {


    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    // Apply the stored theme -->> 

    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" :
        "light_mode";


    // Restore the chats

    // chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header", savedChats);

    chatList.scrollTo(0, chatList.scrollHeight);


}

loadLocalStorage();



// Create a new message element and return it -->>

const createMessageElement = (content, ...classes) => {

    const div = document.createElement("div");

    div.classList.add("message", ...classes);

    div.innerHTML = content;
    return div;

}

// Show typing Effect byu displaying words one by one -->> 

const showTypingEffect = (text, textElement, incomingMessageDiv) => {

    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {

        // Append each word to the text element with a space -->>

        textElement.innerText += (currentWordIndex === 0 ? '' : '  ') + words[currentWordIndex++];

        incomingMessageDiv.querySelector(".icon").classList.add("hide");




        // If all words are displayed -->> 

        if (currentWordIndex === words.length) {

            clearInterval(typingInterval);

            incomingMessageDiv.querySelector(".icon").classList.remove("hide");

            // save chats to local storage -->>

            localStorage.setItem("savedChats", chatList.innerHTML);


        }
        // Scroll to the bottom -->>

        chatList.scrollTo(0, chatList.scrollHeight);


    }, 75);



}

// Fetch response from the API based on user Message-->> 

const generateAPIResponse = async (incomingMessageDiv) => {

    // Get Text Element -->> 

    const textElement = incomingMessageDiv.querySelector(".text");

    // Send a POST request to the API with the user's Message-->> 

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": " application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{
                        text: userMessage
                    }]
                }]
            })

        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.erro.message);


        // Get API response text and remove asterisks from it -->>

        const apiResponse = data?.candidates[0]?.content?.parts[0]?.text.replace(/\*\*(.*?)\*\*/g, '$1');

        // textElement.innerText = apiResponse

        showTypingEffect(apiResponse, textElement, incomingMessageDiv);


    }
    catch (error) {
        
        console.log(error);

        textElement.innerText = error.message;
        textElement.clasList.add("error");
    }
    finally {
        incomingMessageDiv.classList.remove("loading");
    }
}

// Show a loading animation while waiting for the API response -->> 

const showLoadingAnimation = () => {

    const html = `<div class="message-content">
                <img src="./src/Gemini.png" alt="gemini Image" class="avatar">
                <P class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
               
            </div>
            <span onclick = "copyMessage(this)" class="icon material-symbols-rounded">
                content_copy
            </span>`;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");

    // incomingMessageDiv.querySelector(".text").innerText = userMessage;

    chatList.appendChild(incomingMessageDiv);


    // Scroll to the bottom -->> 

    chatList.scrollTo(0, chatList.scrollHeight);

    generateAPIResponse(incomingMessageDiv);

}


// Copy message text to the clipboard -->> 

const copyMessage = (copyIcon) => {

    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);

    // show tick icon

    copyIcon.innerText = "done";

    // Revert the icon after 1 second -->> 

    setTimeout(() => copyIcon.innerText = "content_copy", 1000)
}



// Handle sending outgoing chat messages -->> 

const handleOutgoingChat = () => {

    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;

    if (!userMessage) return; // Exit if there is no message

    const html = `<div class="message-content">
                <img src="./src/Avatar.jpeg" alt="User Image" class="avatar">
                <P class="text"></P>
            </div>`;

    const outgoingMessageDiv = createMessageElement(html, "incoming");

    outgoingMessageDiv.querySelector(".text").innerText = userMessage;

    chatList.appendChild(outgoingMessageDiv);


    typingForm.reset(); //clear input field


    // Scroll to the bottom -->>

    chatList.scrollTo(0, chatList.scrollHeight);

    // Hide the header once the chat is start -->>

    document.body.classList.add("hide-header");

    setTimeout(showLoadingAnimation, 500); // show loading animation after a delay
}


// set UserMessage and handle outgoing chat when a suggestion is clicked -->> 

suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});


// Toggle Themes between light and dark -->> 

toggleThemeButton.addEventListener("click", () => {

    const isLightMode = document.body.classList.toggle("wb_sunny");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

});


// Delete all chats from local storage when delete button is clicked -->>

deleteChat.addEventListener("click", () => {
    if (confirm("Are you sure, you want to delete all messages?")) {
        localStorage.removeItem("savedchats");
        loadLocalStorage();
    }
});

//Prevent default form submission and handle outgoing chat

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutgoingChat();
});