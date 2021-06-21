import { gql } from "@apollo/client";
import client from '../lib/apollo';

export default function Home({locations}) {
  return (
   <main>
     <h1>Hello world</h1>
     {locations.map(({id, name, dimension}) => 
       <div key={id}>
         <h2>
           {name}
         </h2>
         <p>
           {dimension}
         </p>
       </div>
     )}
   </main>
  )
}

const getLocationsQuery = page =>  `query {
  locations(page:${page}){
    info{
      count,
      pages,
      next
    }
    results{
      id,
      name,
      dimension,
      type
    }
  }
}`;

export const getServerSideProps = async (context) => {
  try{
    const firstPage = await client.query({
      query: gql`${getLocationsQuery(1)}`,
    });
  
    const remaingPages = await Promise
      .all(new Array(firstPage.data.locations.info.pages - 1)
      .fill(undefined)
      .map((_, i) => 
        client.query({
          query: gql`${getLocationsQuery(2 + i)}`,
        })
    ));
  
    const locations = [
      firstPage,
      ...remaingPages,
    ].reduce((_locations,page) => [..._locations, ...page.data.locations.results], []);
  
    const dimensions = new Set(locations.map(location => location.dimension));
    const types = new Set(locations.map(location => location.type)); 
  
    return {
      props: {
        locations,
        types: [...types],
        dimensions: [...dimensions]
      }
    };
    
  }catch(error) {
    console.log(error);
    return {
      props: {
        locations:[]
      }
    }
  }
};