import { gql } from '@apollo/client';
import client from '../apollo-client';

const getLocationsQuery = (page) => `query {
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

const getAllLocations = async () => {
    const firstPage = await client.query({
        query: gql`${getLocationsQuery(1)}`,
    });

    const remaingPages = await Promise
        .all(new Array(firstPage.data.locations.info.pages - 1)
            .fill(undefined)
            .map((_, i) => client.query({
                query: gql`${getLocationsQuery(2 + i)}`,
            })));

    const locations = [
        firstPage,
        ...remaingPages,
    ].reduce((_locations, page) => [
        ..._locations,
        ...page.data.locations.results,
    ], []);

    return locations;
};

export default getAllLocations;
