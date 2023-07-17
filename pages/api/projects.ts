import {Project} from "../../components/Projects"

const projects:Project[] = [
    {
      id:"1",
      image:"/default.jpg",
      name: "Property Finderz",
      tech: "React JS / Tailwind / Firebase",
      technologies: ["React", "Redux", "Tailwind", "Google Api", "Zillow API"],
      desc: `This app was built using React JS and is hosted on Firebase. Users are able to search properties based on an Address, City, or ZIP code
          to retrieve a list of active properties currently for sale. You will
          be able to view property information as well as the specific
          location of the property integrated with the Google Maps API. User
          authentication is available so you can signup and signin to your
          account with an email address in order to save your favorite
          properties. This is made possible with Zillow API.`,
      code: "https://github.com/fireclint/property-finder",
      demo: "https://property-finder-development.web.app/",
    }, {
      id:"2",
      name: "sumha 2",
      image:"/default.jpg",      
      tech: "React JS / Tailwind / Firebase",
      technologies: ["React", "Redux", "Tailwind", "Google Api", "Zillow API"],
      desc: `This app was built using React JS and is hosted on Firebase. Users are able to search properties based on an Address, City, or ZIP code
          to retrieve a list of active properties currently for sale. You will
          be able to view property information as well as the specific
          location of the property integrated with the Google Maps API. User
          authentication is available so you can signup and signin to your
          account with an email address in order to save your favorite
          properties. This is made possible with Zillow API.`,
      code: "https://github.com/fireclint/property-finder",
      demo: "https://property-finder-development.web.app/",
    },
];

export default function handler(req, res) {
    const { id } = req.query;
    // console.log("pid==", id);
    res.status(200).json({ projects });
    //   res.end(`Post: ${pid}`);
  }