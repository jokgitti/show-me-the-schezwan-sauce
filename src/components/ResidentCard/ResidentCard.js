/* eslint-disable no-nested-ternary */
import Image from 'next/image';
import PropTypes from 'prop-types';

const ResidentCard = ({
    name, image, gender, status, species,
}) => (
    <div
        className="mb-8 bg-white shadow-md flex flex-col items-center border border-white p-4 rounded-md md:mb-0"
    >
        <Image
            src={image}
            alt={name}
            width={250}
            height={250}
            className="rounded-full"
        />
        <h3 className="font-bold text-2xl mt-2">
            {name}
            <span className="text-base font-normal">
                {' '}
                {gender === 'Female' ? '♀' : gender === 'Male' ? '♂︎' : ''}
            </span>
        </h3>
        <p>
            {status === 'Dead' ? '🥀' : '🌹'}
            {' '}
            {status}
        </p>
        <p>
            {species === 'Human' ? '👤' : '🌈'}
            {' '}
            {species}
        </p>
    </div>
);
ResidentCard.propTypes = {
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
};

export default ResidentCard;
