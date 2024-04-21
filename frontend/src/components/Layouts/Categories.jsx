import mobiles from "../../assets/images/Categories/shoes.jpg";
import mens from "../../assets/images/Categories/mens.png";
import women from "../../assets/images/Categories/women.png";
import kids from "../../assets/images/Categories/kids.png";
import electronics from "../../assets/images/Categories/activewear.jpg";
import unisex from "../../assets/images/Categories/unisex.png";
import appliances from "../../assets/images/Categories/denimwear.jpg";
import beauty from "../../assets/images/Categories/beauty.png";
import accessories from "../../assets/images/Categories/accessories.png";
import { Link } from "react-router-dom";

const catNav = [
  {
    name: "Women's Fashion",
    icon: women,
  },
  {
    name: "Men's Fashion",
    icon: mens,
  },
  {
    name: "Kid's Fashion",
    icon: kids,
  },
  {
    name: "Unisex Fashion",
    icon: unisex,
  },
  {
    name: "Accessories",
    icon: accessories,
  },
  {
    name: "Shoes",
    icon: mobiles,
  },
  {
    name: "Activewear",
    icon: electronics,
  },
  {
    name: "Denimwear",
    icon: appliances,
  },
  {
    name: "Beauty & more",
    icon: beauty,
  },
];

const Categories = () => {
  return (
    <section className="hidden sm:block bg-white mt-10 mb-4 min-w-full px-12 py-1 shadow overflow-hidden">
      <div className="flex items-center justify-between mt-4">
        {catNav.map((item, i) => (
          <Link
            to={`/products?category=${item.name}`}
            className="flex flex-col gap-1 items-center p-2 group"
            key={i}
          >
            <div className="h-16 w-16">
              <img
                draggable="false"
                className="h-full w-full object-contain rounded-full"
                src={item.icon}
                alt={item.name}
              />
            </div>
            <span className="text-sm text-gray-800 font-medium group-hover:text-primary-blue">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
