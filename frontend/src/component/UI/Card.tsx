// import { useEffect, useState } from "react";
// import { ShareIcon } from "../../icons/ShareIcon";
// import { DeleteIcon } from "../../icons/DeleteIcon";
// import { TwitterIcon } from "../../icons/TwitterIcon";
// import { YoutubeIcon } from "../../icons/YoutubeIcon";
// import { Document } from "../../icons/Document";
// import { LinkIcon } from "../../icons/LinkIcon";
// import Microlink from '@microlink/react';

// interface CardProps {
//   title: string;
//   link: string;
//   type: "twitter" | "youtube" | "document" | "links";
//   contentId: string;
//   onDelete?: () => void;
//   date?: string;
//   onClick?: () => void;

// }

// export function Card({ title, link, type, onDelete, date,onClick }: CardProps) {
//   const [displayDate] = useState(() => date ?? new Date().toLocaleDateString("en-US"));
//   async function handleDeleteContent() {
//     try {
//       if (onDelete) onDelete(); 
//     } catch (err) {
//       console.error("Delete trigger failed", err);
//     }
//   }

//   useEffect(() => {
//     if (type === "twitter" && (window as any).twttr) {
//       (window as any).twttr.widgets.load();
//     }
//   }, [link, type]);

//   return (
//     <div onClick={onClick} className="cursor-pointer">
//       <div className="p-4 bg-white rounded-md shadow-md border-gray-200 border-2 w-80 h-[350px] overflow-hidden hover:-translate-y-1 transition duration-400 ease-in-out">
//         <div className="flex justify-between">
//           <div className="flex items-center text-md">
//             <div className="text-gray-500 pr-2">
//               {/* <ShareIcon size="md" /> */}
//               {type ==="twitter" && <a href={link} target="_blank" rel="noopener noreferrer">
//                 <TwitterIcon/>
//               </a>}
//               {type ==="youtube" && <a href={link} target="_blank" rel="noopener noreferrer">
//                 <YoutubeIcon/>
//               </a>}
//               {type==="document" && <Document/>}
//               {type==="links" && <a href={link} target="_blank" rel="noopener noreferrer"><LinkIcon/></a>}
//             </div>
//           </div>
//           <h2 className="text-center text-lg font-semibold w-full">{title}</h2>
//           <div className="flex items-center">
//             <div className="pr-2 text-gray-500">
//               {type!=="document" && (<a href={link} target="_blank" rel="noopener noreferrer"   onClick={(e) => e.stopPropagation()}>
//                 <ShareIcon size="md" />
//               </a>) }
              
//             </div>
//             <div
//               className="text-gray-500 cursor-pointer"
//               onClick={(e) => {
//                   e.stopPropagation();
//                   handleDeleteContent();
//               }}

//             >
//               <DeleteIcon size="md" />
//             </div>
//           </div>
//         </div>

//         <div className="p-4">
//           {type === "youtube" && (
//             <iframe
//               className="w-full h-[200px] rounded"
//               src={link.replace("watch", "embed").replace("?v=", "/")}
//               title="YouTube video player"
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//               referrerPolicy="strict-origin-when-cross-origin"
//               allowFullScreen
//             ></iframe>
//           )}

//           {type === "twitter" && (
//             <div className="w-full max-h-[200px] overflow-auto rounded border border-gray-200">
//               <blockquote className="twitter-tweet w-full h-full overflow-auto">
//                 <a href={link.replace("x.com", "twitter.com")}></a>
//               </blockquote>
//             </div>
//           )}
//           {type === "document" && (
//               <div className="bg-white p-4 rounded-lg shadow-md h-[200px] overflow-auto">
//                 <p className="text-gray-800 whitespace-pre-line mt-2">
//                   {link}
//                 </p>
//               </div>
//           )}
//           {/* {type === "links" && (
//           <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mt-2 inline-block">
//                   Visit Link ↗
//           </a>
//           )} */}
//           {type === "links" && (
//           <div className="mt-2 rounded overflow-hidden w-full h-[200px]">
//               <Microlink url={link} size="large" />
//           </div>
//           )}


//           <p className="text-sm text-gray-500 pt-4">Added on: {displayDate}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { ShareIcon } from "../../icons/ShareIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { TwitterIcon } from "../../icons/TwitterIcon";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { Document } from "../../icons/Document";
import { LinkIcon } from "../../icons/LinkIcon";
import Microlink from '@microlink/react';

interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube" | "document" | "links";
  contentId: string;
  onDelete?: () => void;
  date?: string;
  onClick?: () => void;
}

export function Card({ title, link, type, onDelete, date, onClick }: CardProps) {
  const [displayDate] = useState(() => date ?? new Date().toLocaleDateString("en-US"));

  async function handleDeleteContent() {
    try {
      if (onDelete) onDelete();
    } catch (err) {
      console.error("Delete trigger failed", err);
    }
  }

  useEffect(() => {
    if (type === "twitter" && (window as any).twttr) {
      (window as any).twttr.widgets.load();
    }
  }, [link, type]);

  const typeColors = {
    twitter: "from-sky-50 to-blue-50",
    youtube: "from-red-50 to-rose-50",
    document: "from-slate-50 to-gray-50",
    links: "from-emerald-50 to-teal-50"
  };

  const iconWrapperColors = {
    twitter: "bg-sky-100 text-sky-600",
    youtube: "bg-red-100 text-red-600",
    document: "bg-slate-100 text-slate-600",
    links: "bg-emerald-100 text-emerald-600"
  };

  return (
    <div onClick={onClick} className="cursor-pointer group">
      <div className={`relative bg-gradient-to-br ${typeColors[type]} rounded-2xl shadow-lg border border-gray-200/50 w-90 h-[520px] overflow-hidden transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-2 hover:border-gray-300/70`}>

        
        <div className="relative bg-white/70 backdrop-blur-sm border-b border-gray-200/50 px-5 py-4">
          <div className="flex justify-between items-start gap-3">
            
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${iconWrapperColors[type]} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
              {type === "twitter" && (
                <a href={link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <TwitterIcon />
                </a>
              )}
              {type === "youtube" && (
                <a href={link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <YoutubeIcon />
                </a>
              )}
              {type === "document" && <Document />}
              {type === "links" && (
                <a href={link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                  <LinkIcon />
                </a>
              )}
            </div>

            {/* Title */}
            <h2 className="flex-1 text-center text-lg font-bold text-gray-800 line-clamp-2 leading-tight">
              {title}
            </h2>

            
            <div className="flex items-center gap-1">
              {type !== "document" && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <ShareIcon size="md" />
                </a>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteContent();
                }}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                <DeleteIcon size="md" />
              </button>
            </div>
          </div>
        </div>

       
        <div className="p-5">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {type === "youtube" && (
              <iframe
                className="w-full h-[320px]"
                src={link.replace("watch", "embed").replace("?v=", "/")}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            )}

            {type === "twitter" && (
              <div className="w-full h-[320px] overflow-auto">
                <blockquote className="twitter-tweet w-full h-full overflow-auto">
                  <a href={link.replace("x.com", "twitter.com")}></a>
                </blockquote>
              </div>
            )}

            {type === "document" && (
              <div className="p-4 h-[320px] overflow-auto">
                <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                  {link}
                </p>
              </div>
            )}

            {type === "links" && (
              <div className="h-[320px] overflow-hidden">
                <Microlink url={link} size="large" />
              </div>
            )}
          </div>

          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <p className="text-xs font-medium text-gray-500">
                Added on {displayDate}
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {type}
            </div>
          </div>
        </div>

        
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500"></div>
      </div>
    </div>
  );
}
