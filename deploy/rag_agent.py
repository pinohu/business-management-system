# RAG Agent Template (for retrieval-augmented generation)
# Assumes usage with LangChain, LlamaIndex, or similar frameworks

from langchain.vectorstores import FAISS
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

loader = DirectoryLoader('./docs', glob="**/*.md")
docs = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
split_docs = splitter.split_documents(docs)

vectorstore = FAISS.from_documents(split_docs, OpenAIEmbeddings())
retriever = vectorstore.as_retriever()

qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model_name="gpt-4"),
    retriever=retriever,
    return_source_documents=True
)

query = "What is the full scope of the application?"
print(qa.run(query))
