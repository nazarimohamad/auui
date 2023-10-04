import React from "react";
import axios from 'axios';
import { useState } from "react";
import { set, useForm } from "react-hook-form"
import CodeEditor from '@uiw/react-textarea-code-editor';
import './App.css'

const formStyle = "bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2"
const inputStyle = "bg-white h-12 w-full px-5 pr-10 mt-5 rounded-full text-sm border-2 border-solid border-gray-300 focus:outline-none"


function App() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isloading, setIsLoading] = useState(false)
  const [githubUrl, setGithubUrl] = useState('');
  const { register, formState: { errors } } = useForm()
  const [code, setCode] = React.useState(
    `function add(a, b) {\n  return a + b;\n}`
  );
  const apiUrl = 'api/aitest';
    const headers = {
      'Content-Type': 'application/json'
    };
  
    const requestOptions = {
      method: 'GET', 
      headers: new Headers(headers)
    };
  
  const ErrorMsg = ({ inputName }) => (
    <>
      {errors[inputName] && (
        <small className="text-sm text-red-400 font-medium block mt-1 px-4">
          {
            errors[inputName]['message'] ?
            errors[inputName]['message'] :
            errors[inputName]['type'] === 'allowed' ?
            `invalid url` :
            `${inputName} is required`
          }
        </small>
      )}
    </>
  )


  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert('Text copied to clipboard!');
    } catch (err) {
      console.error('Unable to copy text: ', err);
    }
  };

  const handleInputChange = (event) => {
    setGithubUrl(event.target.value);
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text');
    setGithubUrl(pastedText);
  };

  const getTestCode = () => {

    setIsLoading(true);
 
    fetch(apiUrl + `?${githubUrl}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); 
      })
      .then((data) => {
      const responseData = data.answer;
      const codePattern = /```javascript([\s\S]*?)```/;
      const matches = responseData.match(codePattern);
      const extractedCode = matches ? matches[1] : '';
      setCode(extractedCode);
      setIsSubmitted(true);
      setIsLoading(false)
      })
      .catch((error) => {
        setIsLoading(false);
        console.error('Fetch error:', error);
      });

  };


  
  if (isSubmitted)
    return (
      <div className="w-full md:w-1/2 xl:w-1/3 container mx-auto pt-4 md:pb-1 rounded-md">
        <div className={`${formStyle} items-center`}>
        <button 
          className="w-full text-md px-5 py-2 my-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none cursor-pointer"
          onClick={handleCopyClick}
        >copy code </button>
           <CodeEditor
              value={code}
              language="js"
              placeholder="E2E tests."
              padding={15}
              onCopy={() => console.log(`copied ${code}`)}
              onCopyCapture={() => console.log(code)}
              style={{
                fontSize: 12,
                backgroundColor: "#f5f5f5",
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
            />
          <button
            className="text-indigo-500"
            onClick={e => setIsSubmitted(false)}
          >
            Try again
          </button>
         
        </div>
      </div>
    )
  
  return (
    <div className="w-full md:w-1/2 xl:w-1/3 container mx-auto pt-4 md:pb-1  rounded-md">
      <div className={formStyle} 
      >
        <h1 class="title text-4xl text-center">aitest</h1>
        <h3
          className="text-sm text-center px-4 my-3"
        >
          Add your github url for writing test
        </h3>

        <input 
          {...register("url", { 
              required: true, 
              // validate: {
              //   allowed: validateUsername
              // } 
          })} 
          type="text"
          value={githubUrl}
          className={inputStyle}
          placeholder="Github url"
          onChange={handleInputChange}
         />
				 <ErrorMsg inputName="url" />

        {isloading 
        ? <>
          <div>Data is on processing, It may take a couple of minutes</div>
          <span class="loader"></span>
          </>
        : <></>}

          <button
            className="w-full text-md px-5 py-2 my-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none cursor-pointer"
            onClick={getTestCode}
          >
            submit
          </button>
        {/* <input 
          type="submit"
          className="w-full text-md px-5 py-2 my-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none cursor-pointer"
        /> */}
      </div>
   </div>
  )
}


export default App;