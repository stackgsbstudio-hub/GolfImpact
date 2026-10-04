import { useEffect } from "react";

const COMPANY_NAME = "GolfImpact";

const PageTitle = ({ title }) => {
  useEffect(() => {
    document.title = title ? `${title} | ${COMPANY_NAME}` : COMPANY_NAME;
  }, [title]);

  return null;
};

export default PageTitle;
