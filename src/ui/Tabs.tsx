
import React, { FunctionComponent, ReactFragment, useState } from 'react';


interface Tab {
  title: string;
  content: ReactFragment;
}

interface TabsProps {
  tabs: Tab[];
};

export const Tabs: FunctionComponent<TabsProps> = ({ tabs }) => {

  const [ state, setState ] = useState(0);

  const handleTabClick = (index: number) => {
    setState(index);
  };

  return(
    <div className="flex flex-col">
      { tabs.length === 0 ? <p className="text-center p-4 rounded-lg bg-gradient-to-r from-stone-200 to-stone-300">Nothing to display here :/</p> : '' }
      {
        tabs.length > 0
        ? <>
            <div className="flex flex-row">
              {
                tabs.map((tab, index) =>
                  <div
                    key={index}
                    onClick={() => handleTabClick(index)}
                    className={`border-stone-600 border-opacity-40 rounded-t-lg px-2 py-1 font-semibold ${ index === state ? 'border-x border-t' : 'border-b bg-stone-200 cursor-pointer hover:shadow-lg'}`}
                  >
                    {tab.title}
                  </div>
                )
              }
              <div className="border-b border-stone-600 border-opacity-40 grow"></div>
            </div>
            <div className="border-x border-b rounded-b-lg border-stone-600 border-opacity-40 px-4 py-2">
              { tabs[state].content }
            </div>
          </>
        : ''
      }
    </div>
  );
};
