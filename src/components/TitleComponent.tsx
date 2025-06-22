interface TitleProps {
    title: string;
  }


  const TitleComp: React.FC<TitleProps> = ({ title }) => {
    return (
        <head>
            <title>{`${title}`}</title>
        </head>
    );
  };
  
  export default TitleComp;