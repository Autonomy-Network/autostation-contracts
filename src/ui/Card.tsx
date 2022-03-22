
import React, { FunctionComponent } from 'react';

interface CardProps {
  className?: string;
};

export const Card: FunctionComponent<CardProps> = ({ className = '',children }) => {

  return(
    <section className={`bg-gradient-to-br from-white to-autonomyPrimary200 px-8 py-4 rounded-lg shadow-lg flex flex-col gap-4 pb-4 ${className}`}>
      {children}
    </section>
  );
};
