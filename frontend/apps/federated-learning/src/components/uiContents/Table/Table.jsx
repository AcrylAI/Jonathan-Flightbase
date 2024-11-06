import DataTable from 'react-data-table-component';

import { Emptybox, Loading } from '@jonathan/ui-react';

import './Table.scss';

function Table({ columns, data, loading, emptyMessage = '' }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      className='datatable'
      progressPending={loading}
      progressComponent={
        <Loading
          customStyle={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
          }}
        />
      }
      sortIcon={<span className='arrow'></span>}
      noDataComponent={
        <Emptybox
          customStyle={{
            height: '120px',
            width: '100%',
            color: '#C2C2C2',
            backgroundColor: '#000000',
          }}
          text={emptyMessage}
        />
      }
      pagination={true}
      paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30, 50, 100, 300]}
      theme='dark'
      allowOverflow
      persistTableHead
    />
  );
}

export default Table;
