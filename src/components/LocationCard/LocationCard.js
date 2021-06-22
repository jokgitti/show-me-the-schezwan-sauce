/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

const LocationCard = ({
    id, name, dimension, type,
}) => {
    const router = useRouter();

    const onClick = (e) => {
        e.preventDefault();
        router.push(`/location/${id}`);
    };

    return (
        <div
            className="mb-4 bg-white shadow-md flex flex-col border border-white p-4 rounded-md md:mb-0 hover:border-purple-600 transform hover:translate-y-1 transition-colors transition-transform"
            onClick={onClick}
            role="button"
            tabIndex="0"
        >
            <h2
                className="font-bold text-lg pb-2 overflow-ellipsis overflow-hidden whitespace-nowrap"
                title={name}
            >
                {name}
            </h2>
            <p className="text-gray-500">
                🔮
                {' '}
                {dimension}
            </p>
            <p className="text-gray-500">
                🌍
                {' '}
                {type}
            </p>
        </div>
    );
};

LocationCard.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    dimension: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
};

export default LocationCard;
