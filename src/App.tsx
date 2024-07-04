// @ts-ignore
import React, {useEffect, useRef, useState} from 'react'
import {gitignoreData} from "./gitignore.ts";
import SelectList from "./components/SelectList.tsx";
import {gitignoreStructure} from "./gitignore-structure.ts";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentIcon,
  FolderArrowDownIcon
} from "@heroicons/react/16/solid";


function App() {

  let allGitignores: string[] = []
  let allTagsArr: string[] = []

  const prepareData = () => {
    allGitignores = []
    let allTagsTmp = new Set<string>()
    allWithTags.forEach(at => {
      allGitignores.push(at.key);
      at.tags.forEach(t => allTagsTmp.add(t));
    })
    allTagsArr = [...allTagsTmp].sort((a, b) => a.localeCompare(b))
    setAllTags(allTagsArr)
  }

  const [allWithTags, setAllWithTags] = useState(gitignoreStructure.allWithTags)
  const [selectedGitignores, setSelectedGitignores] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [content, setContent] = useState("")
  const [gitignoreFilterText, setGitignoreFilterText] = useState("")
  const [filteredByTags, setFilteredByTags] = useState(allGitignores)
  const [filteredElems, setFilteredElems] = useState(filteredByTags)
  const [savedListName, setSavedListName] = useState("")
  const [allTags, setAllTags] = useState<string[]>([])
  const [allLists, setAllLists] = useState(gitignoreStructure.lists)
  const uploadFileButtonRef = useRef<any>(null)

  useEffect(() => {
    prepareData();
  }, [allWithTags]);

  useEffect(() => {
    let tmpContent = "";
    for (const item of selectedGitignores) {
      tmpContent += gitignoreData[item] + "\n\n";
    }
    setContent(tmpContent);
  }, [selectedGitignores]);

  useEffect(() => {
    if (gitignoreFilterText.trim().length === 0) {
      setFilteredElems(filteredByTags)
    }
    const rgx = new RegExp(".*" + gitignoreFilterText.trim() + ".*");
    const newElemes = filteredByTags.filter(e => e.toLowerCase().match(rgx))
    setFilteredElems(newElemes)
  }, [gitignoreFilterText, filteredByTags]);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredByTags(allWithTags.map(t => t.key))
      return
    }
    const filteredByTagsTmp: { key: string; tags: string[]; }[] = []
    allWithTags.forEach(at => {
      at.tags.forEach(t => {
        if (selectedTags.indexOf(t) > -1) {
          filteredByTagsTmp.push(at)
        }
      })
    })
    setFilteredByTags(filteredByTagsTmp.map(f => f.key))
  }, [selectedTags]);

  const toggleItem = (item: string) => {
    const shouldDeselect = selectedGitignores.indexOf(item) > -1;
    if (shouldDeselect) {
      setSelectedGitignores(selectedGitignores.filter(i => i !== item))
    } else {
      setSelectedGitignores([...selectedGitignores, item])
    }
  }

  const toggleTag = (item: string) => {
    const shouldDeselect = selectedTags.indexOf(item) > -1;
    if (shouldDeselect) {
      setSelectedTags(selectedTags.filter(i => i !== item))
    } else {
      setSelectedTags([...selectedTags, item])
    }
  }

  const toggleList = (listName: string) => {
    for (let i = 0; i < allLists.length; i++) {
      if (allLists[i].name === listName) {
        setSelectedGitignores(allLists[i].keys)
        break;
      }
    }
  }

  // const saveTag = () => {
  //   const tmpSavedTag = savedListName.trim()
  //   if (tmpSavedTag.length === 0) {
  //     return
  //   }
  //   const newAllWithTags = [...allWithTags]
  //   for (const selectedGitignore of selectedGitignores) {
  //     const targetElem = newAllWithTags.find(e => e.key === selectedGitignore)
  //     if (targetElem) {
  //       targetElem.tags = Array.from((new Set(targetElem.tags)).add(tmpSavedTag))
  //     }
  //   }
  //   setAllWithTags(newAllWithTags)
  //   setSavedListName("")
  // }

  const saveListName = () => {
    const tmpSavedListName = savedListName.trim()
    if (tmpSavedListName.length === 0) {
      return
    }
    const newAllLists = [...allLists]
    let found = false
    for (let i = 0; i < newAllLists.length; i++) {
      if (newAllLists[i].name === tmpSavedListName) {
        newAllLists[i].keys = [...selectedGitignores]
        found = true
        break
      }
    }
    if (!found) {
      newAllLists.push({
        name: tmpSavedListName,
        keys: [...selectedGitignores]
      })
    }
    setAllLists(newAllLists)
    setSavedListName("")
  }

  const downloadGitignore = () => {
    const filename = '_.gitignore';

    const fullContent =  content.trim() +
      (content.trim().length > 0 ? "\n\n# Made with: https://github.com/alexadam/gitignore-builder" : "")

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fullContent));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const downloadDataAsJson = () => {
    let filename = 'gitignore_data.json';

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({
        ...gitignoreStructure,
        allWithTags,
        lists: allLists,
      }, null, 2)));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const onImport = (e: any) => {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (ev: any) => {
      const text = (ev.target.result)
      const jsonData = JSON.parse(text)
      setAllWithTags(jsonData.allWithTags)
      setAllLists(jsonData.lists)
    };
    reader.readAsText(e.target.files[0])
  }


  return (
    <div className="flex flex-col w-full h-screen">
      <header className="w-full p-3 bg-gray-200 flex flex-row flex-shrink-0 justify-between">
        <h1 className="font-bold">
          .gitignore builder
        </h1>
        <div>
          <button
            className="w-40 mr-2 inline-flex justify-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={downloadDataAsJson}>
            <ArrowDownTrayIcon className="-ml-0.5 h-5 w-5" aria-hidden="true"/>
            Save as Json
          </button>
          <button
            className="w-40 mr-2 inline-flex justify-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => uploadFileButtonRef.current?.click()}
          >
            <input style={{
              display: 'none',
            }} ref={uploadFileButtonRef} type="file" onChange={onImport}/>
            <ArrowUpTrayIcon className="-ml-0.5 h-5 w-5" aria-hidden="true"/>
            Load from Json
          </button>
          <a href="https://github.com/alexadam/gitignore-builder" className="inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 16 16" width="20" aria-hidden="true"
                 className="d-block">
              <path fill="black"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </a>
        </div>
      </header>
      <div className="flex flex-row w-full h-full flex-grow-0 min-h-0">
        <div className="flex flex-col h-full w-[150px]">
          <div className="flex flex-col p-5 h-full border-b-2 items-start overflow-y-auto no-scrollbar">
            <b className="pb-4">Categories</b>
            {
              allTags.map(t => <button key={t} onClick={() => toggleTag(t)}
                                       className={
                                         selectedTags.indexOf(t) > -1 ?
                                           'mb-1 inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20'
                                           :
                                           'mb-1 inline-flex items-center rounded-md  px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20'
                                       }
              >{t}</button>)
            }
          </div>
          <div className="flex flex-col p-5 h-full overflow-y-auto no-scrollbar">
            <b className="pb-4 w-full">Lists</b>
            {
              allLists.map(t => <button key={t.name} onClick={() => toggleList(t.name)}
                                        className={
                                          'mb-1 inline-flex items-center justify-center rounded-md bg-violet-300 px-2 py-1 text-xs font-medium text-violet-800 ring-1 ring-inset ring-violet-600/20'
                                        }
              >{t.name}</button>)
            }
          </div>
        </div>
        <div className="h-full w-3/12 flex flex-col p-2 border-l-2">
          <div className="relative mt-2 mb-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              className="block w-full border-0 bg-gray-50 py-1.5 pl-10 text-gray-900 focus:ring-0 sm:text-sm sm:leading-16"
              type="text" value={gitignoreFilterText} onChange={e => setGitignoreFilterText(e.target.value)}/>
            <div
              className="absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600"
              aria-hidden="true"
            />
          </div>
          <SelectList items={filteredElems} onToggle={toggleItem} selectedItems={selectedGitignores}/>
        </div>
        <div className="h-full w-3/12 flex flex-col p-2 border-l-2">
          <SelectList items={selectedGitignores} onToggle={toggleItem} selectedItems={selectedGitignores}
                      withDeleteButton={true} center={true}/>
          <div className="flex flex-row w-full mb-5">
            <input
              className="block w-full border-0 bg-gray-50 py-1 pl-2 text-gray-900 focus:ring-0 sm:text-sm sm:leading-16"
              type="text" placeholder="List Name" value={savedListName}
              onChange={(e) => setSavedListName(e.target.value)}/>
            <button
              className="w-40 rounded-md bg-green-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={saveListName}>Save List
            </button>
            <div
              className="absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600"
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="h-full w-6/12 flex flex-col p-2">
          <textarea name="" id=""
                    className="h-full w-full shadow-lg p-5 mb-2"
                    value={
                      content.trim() +
                      (content.trim().length > 0 ? "\n\n# Made with: https://github.com/alexadam/gitignore-builder" : "")
                    }
                    onChange={e => setContent(e.target.value)}
          >
          </textarea>
          <div className="flex flex-row justify-end">
            <button
              className="w-40 mr-2 inline-flex justify-center gap-x-1.5 rounded-md bg-green-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => navigator.clipboard.writeText(content.trim() +
                (content.trim().length > 0 ? "\n\n# Made with: https://github.com/alexadam/gitignore-builder" : ""))}>
              <ClipboardDocumentIcon className="-ml-0.5 h-5 w-5" aria-hidden="true"/>
              Copy
            </button>
            <button
              className="w-60 inline-flex justify-center gap-x-1.5 rounded-md bg-green-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={downloadGitignore}>
              <FolderArrowDownIcon className="-ml-0.5 h-5 w-5" aria-hidden="true"/>
              Download .gitignore
            </button>
          </div>
        </div>
      </div>
    </div>

  )
}

export default App
