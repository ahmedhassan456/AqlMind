import streamlit as st
from scrapling.fetchers import StealthyFetcher
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

import asyncio
if hasattr(asyncio, 'WindowsProactorEventLoopPolicy'):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

StealthyFetcher.auto_match = True

st.set_page_config(page_title="AqlMind", page_icon=":brain:", layout="wide")
st.title("AqlMind🧠")
st.sidebar.header("Settings")
api_key = st.sidebar.text_input("Gemini API Key", type="password")
url = st.sidebar.text_input("Website URL")


if st.sidebar.button("Load URL"):
    if api_key and url:
        with st.spinner("Fetching website content..."):
            try:
                page = StealthyFetcher.fetch(url, headless=True, network_idle=True)
                st.session_state.page_content = page.html_content
                st.session_state.current_url = url
                st.session_state.conversation = []
                st.session_state.llm_messages = [
                    SystemMessage(f"You Have to answer the question based on the content of the page: {st.session_state.page_content}"),
                ]
            except Exception as e:
                st.error(f"Error fetching URL: {e}")
    else:
        st.error("Please provide both API key and URL.")


if "page_content" in st.session_state:
    if st.sidebar.button("Clear Chat"):
        st.session_state.conversation = []
        st.session_state.llm_messages = [
            SystemMessage(f"You Have to answer the question based on the content of the page: {st.session_state.page_content}"),
        ]

st.sidebar.markdown("**Note:** Your API key is used server-side and not exposed to the client. Keep it secure.")

if "page_content" in st.session_state:
    st.write(f"Chatting with content from: {st.session_state.current_url}")
    
    for msg in st.session_state.conversation:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])
    
    query = st.chat_input("Ask a question about the website content")
    if query:
        st.session_state.conversation.append({"role": "user", "content": query})
        with st.chat_message("user"):
            st.write(query)
        
        with st.spinner("Getting response..."):
            try:
                llm = ChatGoogleGenerativeAI(
                    model="gemini-2.5-flash",
                    google_api_key=api_key,
                )
                st.session_state.llm_messages.append(HumanMessage(content=query))
                response = llm.invoke(st.session_state.llm_messages).content
                st.session_state.conversation.append({"role": "assistant", "content": response})
                with st.chat_message("assistant"):
                    st.write(response)
            except Exception as e:
                st.error(f"Error getting response: {e}")
else:
    st.write("Please load a URL to start chatting.")
