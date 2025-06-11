import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import TheaterPage from './TheaterPage';
import TheatresTable from './TheatresTable';

const Theatres = () => {
  return (
    <div>
      <Breadcrumb pageName="Manage Theatres" />

      <TheatresTable />

      {/* New UI */}
      {/* <TheaterPage/> */}
    </div>
  );
};

export default Theatres;
