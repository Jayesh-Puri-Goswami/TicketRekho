import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
// import TermsTable from '../components/Tables/TermsTable';
import TermsGrid from '../components/Utils/TermsGrid';

const Terms = () => {
  return (
    <div>
      <Breadcrumb pageName="Terms & Conditions" />

      {/* <TermsTable /> */}
      <TermsGrid/>
    </div>
  );
};

export default Terms;
