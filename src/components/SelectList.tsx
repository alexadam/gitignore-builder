import {XMarkIcon} from "@heroicons/react/16/solid";

interface ISelectListProps {
  items: string[]
  selectedItems: string[]
  onToggle: (item: string) => void
  withDeleteButton?: boolean
  center?: boolean
}

const SelectList = (props: ISelectListProps) => {


  return (
    <div
      className={"flex flex-col flex-grow-0 w-full h-full overflow-y-auto p-1 content-start justify-start items-start no-scrollbar " + (
        props.center ? "justify-center items-center" : ""
      )}>
      {
        props.items.map(i =>
          props.withDeleteButton ?
            <div className="flex flex-row" key={i}>
              <button
                   className={'mb-1 w-auto ' +
                     (props.selectedItems.indexOf(i) === -1 ? 'rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50' : 'rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600')}
              >
                {i.replace(".gitignore", "")}
              </button>
              <button
                className="rounded-md px-2 py-1 text-sm font-semibold text-black shadow-sm hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:text-red-600"
                onClick={() => props.onToggle(i)}>
                <XMarkIcon className="-ml-0.5 h-5 w-5" aria-hidden="true"/>
              </button>
            </div>
            :
            <button key={i}
                 onClick={() => props.onToggle(i)}
                 className={'mb-1 w-auto ' +
                   (props.selectedItems.indexOf(i) === -1 ? 'rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50' : 'rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600')}
            >
              {i.replace(".gitignore", "")}
            </button>)
      }
    </div>
  );
};

export default SelectList;