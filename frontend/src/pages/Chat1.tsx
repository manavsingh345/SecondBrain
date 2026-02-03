import { MyContext } from "./Context"
import { useContext, useEffect, useState } from "react"
import "./Chat1.css"
import ResponseRenderer from "./ResponseRender"

export default function Chat1(){
    const {newChat,prevChats,reply} = useContext(MyContext);
    const [latestReply,setLatestReply]=useState("");

    useEffect(()=>{
        if(reply===""){
            setLatestReply("");     //prevChats ko load kar rhe hai
            return;
        }
        if(!prevChats.length) return;

        const content=reply.split(" ");
        let idx=0;
        const interval=setInterval(()=>{
            setLatestReply(content.slice(0,idx+1).join(" "));
            idx++;

            if(idx>=content.length) clearInterval(interval);
        },40);
        return () => clearInterval(interval);
    },[prevChats,reply]);
    
    return (
        <>
        {newChat && <h1 className="text-3xl pt-10">BrainBox Welcome's you!</h1>}
        <div className="chats w-full">
            {
                prevChats?.slice(0,-1).map((chat,idx)=>
                <div className={chat.role==="user" ? "userDiv" : "gptDiv"} key={idx}>
                   {chat.role==="user" ? 
                <div>
                    {chat.fileUrl && (
                <a
                    href={chat.fileUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-gray-200 px-2 py-1 rounded-lg text-sm shadow mb-1"
                >
                <i className="fa-solid fa-file text-gray-700"></i>
                <span className="max-w-[140px] truncate">{chat.fileName}</span>
                </a>
                )}
                <p className="userMessage">{chat.content}</p>
                </div>: 
                    <div className="prose max-w-none dark:prose-invert">
                    <ResponseRenderer content={chat.content} />
                </div>
                    }
                </div>
            )
            }
            {
                prevChats.length>0 && latestReply!=="" && 
                <div className="gptDiv" key={"typing"}>
                    <ResponseRenderer content={latestReply}/>
                </div>
            }
            {
                prevChats.length>0 && latestReply ==="" &&          //store the last reply answer also to display
                <div className="gptDiv" key={"non-typing"}>
                    <ResponseRenderer content={prevChats[prevChats.length-1].content}/>    
                </div>
            }
            
        </div>
        </>
    )
}