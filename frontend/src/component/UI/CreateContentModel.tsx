// import { useRef, useState } from 'react';
// import { CrossIcon } from '../../icons/CrossIcon.tsx';
// import { Button } from './Button.tsx';
// import { Input } from './Input.tsx';
// import axios from 'axios';
// import { BACKEND_URL } from '../../config.ts';
// import { YoutubeIcon } from '../../icons/YoutubeIcon.tsx';
// import { TwitterIcon } from '../../icons/TwitterIcon.tsx';
// import { Document } from '../../icons/Document.tsx';
// import { LinkIcon } from '../../icons/LinkIcon.tsx';
// import { SubmitIcon } from '../../icons/SubmitIcon.tsx';

// enum ContentType {
//   Youtube = "youtube",
//   Twitter = "twitter",
//   Document = "document",
//   Links = "links"
// }

// export function CreateContentModel({ open, onClose }: any) {
//     const titleRef = useRef<HTMLInputElement | null>(null);
//     const linkRef = useRef<HTMLInputElement | null>(null);
//     const textRef= useRef<HTMLTextAreaElement | null>(null);

//   const [type,setType]=useState(ContentType.Youtube);
//   async function addContent() {
//       const title = titleRef.current?.value;
//       const link =
//     type === ContentType.Document
//       ? textRef.current?.value
//       : linkRef.current?.value;

//   try {
//     await axios.post(`${BACKEND_URL}/api/v1/content`, {
//       link,
//       title,
//       type
//     }, {
//       headers: {
//         "Authorization": localStorage.getItem("token")
//       }
//     });
//     onClose();
//   } catch (error: any) {
//     console.error("Failed to add content:", error);
//     alert("Something went wrong. Please try again.");
//   }
// }


//   return (
//   <div>
//     {open && (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
//         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
//           {/* Close Button */}
//           <div className="flex justify-end">
//             <button onClick={onClose} className="text-gray-500 cursor-pointer">
//               <CrossIcon />
//             </button>
//           </div>

//           {/* Header */}
//         <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-center tracking-tight">
//                 Craft Your Content Here
//         </h2>



//           {/* Input Fields */}
//           <div className="space-y-3">
//             <Input ref={titleRef} placeholder="Title" />
//             {type === ContentType.Document ? (
//               <textarea
//                 ref={textRef}
//                 placeholder="Write your note here..."
//                 className="w-full h-36 p-3 border border-gray-300 rounded-lg resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             ) : (
//               <Input ref={linkRef} placeholder="Link" />
//             )}
//           </div>

//           {/* Type Selector */}
//           <div className="mt-6">
//             <h3 className="text-center font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500 font-medium mb-2">What Are You Adding?</h3>
//             <div className="flex justify-between gap-2">
//               <Button
//                 size="md"
//                 text="Youtube"
//                 startIcon={<YoutubeIcon/>}
//                 variant={type === ContentType.Youtube ? "primary" : "secondary"}
//                 onClick={() => setType(ContentType.Youtube)}
//               />
//               <Button
//                 size="md"
//                 text="Twitter"
//                 startIcon={<TwitterIcon/>}
//                 variant={type === ContentType.Twitter ? "primary" : "secondary"}
//                 onClick={() => setType(ContentType.Twitter)}
//               />
//               <Button
//                 size="md"
//                 text="Document"
//                 startIcon={<Document/>}
//                 variant={type === ContentType.Document ? "primary" : "secondary"}
//                 onClick={() => setType(ContentType.Document)}
//               />
//               <Button
//                 size="md"
//                 text="Links"
//                 startIcon={<LinkIcon/>}
//                 variant={type === ContentType.Links ? "primary" : "secondary"}
//                 onClick={() => setType(ContentType.Links)}
//               />
//             </div>
//           </div>

//           {/* Submit */}
//           <div className="mt-6 flex justify-center">
//             <Button onClick={addContent} variant="primary" text="Craft" size="md" startIcon={<SubmitIcon/>}/>
//           </div>
//         </div>
//       </div>
//     )}
//   </div>
// );
// }

import { useRef, useState } from 'react';
import { CrossIcon } from '../../icons/CrossIcon.tsx';
import { Button } from './Button.tsx';
import { Input } from './Input.tsx';
import axios from 'axios';
import { BACKEND_URL } from '../../config.ts';
import { YoutubeIcon } from '../../icons/YoutubeIcon.tsx';
import { TwitterIcon } from '../../icons/TwitterIcon.tsx';
import { Document } from '../../icons/Document.tsx';
import { LinkIcon } from '../../icons/LinkIcon.tsx';
import { SubmitIcon } from '../../icons/SubmitIcon.tsx';

enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter",
  Document = "document",
  Links = "links"
}

export function CreateContentModel({ open, onClose }: any) {
    const titleRef = useRef<HTMLInputElement | null>(null);
    const linkRef = useRef<HTMLInputElement | null>(null);
    const textRef= useRef<HTMLTextAreaElement | null>(null);

  const [type,setType]=useState(ContentType.Youtube);
  async function addContent() {
      const title = titleRef.current?.value;
      const link =
    type === ContentType.Document
      ? textRef.current?.value
      : linkRef.current?.value;

  try {
    await axios.post(`${BACKEND_URL}/api/v1/content`, {
      link,
      title,
      type
    }, {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    });
    onClose();
  } catch (error: any) {
    console.error("Failed to add content:", error);
    alert("Something went wrong. Please try again.");
  }
}


  return (
  <div>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 m-4 transform transition-all animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Add New Content
              </h2>
              <p className="text-sm text-gray-500 mt-1">Save and organize your favorite content</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <CrossIcon />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input ref={titleRef} placeholder="Enter a descriptive title..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {type === ContentType.Document ? "Content" : "Link"}
              </label>
              {type === ContentType.Document ? (
                <textarea
                  ref={textRef}
                  placeholder="Write your note here..."
                  className="w-full h-40 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                />
              ) : (
                <Input ref={linkRef} placeholder="Paste your link here..." />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setType(ContentType.Youtube)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    type === ContentType.Youtube
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <YoutubeIcon />
                  <span className={`text-xs font-medium mt-2 ${
                    type === ContentType.Youtube ? "text-blue-700" : "text-gray-600"
                  }`}>
                    YouTube
                  </span>
                </button>

                <button
                  onClick={() => setType(ContentType.Twitter)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    type === ContentType.Twitter
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <TwitterIcon />
                  <span className={`text-xs font-medium mt-2 ${
                    type === ContentType.Twitter ? "text-blue-700" : "text-gray-600"
                  }`}>
                    Twitter
                  </span>
                </button>

                <button
                  onClick={() => setType(ContentType.Document)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    type === ContentType.Document
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Document />
                  <span className={`text-xs font-medium mt-2 ${
                    type === ContentType.Document ? "text-blue-700" : "text-gray-600"
                  }`}>
                    Document
                  </span>
                </button>

                <button
                  onClick={() => setType(ContentType.Links)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    type === ContentType.Links
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <LinkIcon />
                  <span className={`text-xs font-medium mt-2 ${
                    type === ContentType.Links ? "text-blue-700" : "text-gray-600"
                  }`}>
                    Links
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={addContent}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <SubmitIcon />
              <span>Save Content</span>
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
