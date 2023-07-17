import {LINKS} from "./myLinks";

export const projectsData = {

    0: {
        name: "Best Eats",
        id: '0',
        image:"/assets/projects/bestEats.png",
        tech: "React JS / Tailwind ",
        technologies: ["React", "Redux", "Tailwind", ],
        desc: `  A food listing and delivery website made with ReactJs and tailwind css that list different
         foods from different restaurants.
          Users can Filter Foods based on their prices or Categories,
          it also list different menu items for foods based on their ingredients`,
        code: "https://github.com/birukbelay",
        demo: LINKS.BEST_EATS,
    },
    3: {
        name: "Trip Advisor",
        id: '3',
        image:"/assets/projects/tripAdvisor.png",
        tech: "React JS / Tailwind ",
        technologies: ["React",  "Tailwind"],
        desc: ` A travelling website with details about different trip locations where users can book trips based on their need,
        this website also displays major tourism spots and best hotels to be reserved for their conveniences`,
        code: "https://github.com/birukbelay",
        demo: LINKS.TRIP_ADVISOR,
    },
    1: {
        id: '1',
        image:"/assets/projects/property.jpg",
        name: "Bet-Lembosa Real-Estates",
        tech: "React JS / Tailwind / Firebase / Python Flask/ Postgres",
        technologies: ["React", "Tailwind",  "Flask", "Open Api Swagger", "Postgresql", "Firebase"],
        desc: `This app was built using Flask for the backend with postgress database  and React JS on the frontend,
         This project uses firebase for authentication and is hosted on Heroku.
         Users are able to search properties based on an Address, City, or different properties
        to retrieve a list of active properties currently for sale. You will
        be able to view property information as well as the specific
        location . User  authentication is available so you can signup and signin to your
        account with an email address in order to save your favorite
        properties. `,
        code: "https://github.com/",
        demo: "https://heroku.com/",
    },2: {
        id: '2',
        name: "My Movies",
        image:"/assets/projects/netflix.jpg",
        tech: "React JS / Tailwind / Nodejs /Firebase /Mongodb /Nodejs",
        technologies: ["React", "Redux", "Tailwind", "Nodejs", "Mongodb"],
        desc: `A movie catalog website made using Nodejs on the backend(express js), 
        React for the frontEnd, and redux for state management with cashing and persisting state.
        On the backend it uses mongodb for data storage and uses firebase Bucket for image uploads .
        this project was uploaded to heroku and uses mongodb atlas for data storage`,
        code: "https://github.com/birukbelay",
        demo: "https://heroku.com/",
    },
};