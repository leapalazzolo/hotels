import React from "react";
import Moment from "moment";

import "./App.css";

import Hero from "./components/Hero";
import Filters from "./components/Filters";
import Hotels from "./components/Hotels";
import Loader from "./components/Loader";
import Message from "./components/Message";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dateLimits: {
        dateFrom: {
          min: Moment(),
          max: Moment().add(3, "month"),
        },
        dateTo: {
          min: null,
          max: null,
        },
      },
      filters: {
        dateFrom: Moment(),
        dateTo: Moment().add(1, "day"),
        country: null,
        price: null,
        rooms: null,
      },
      hotels: [],
      options: {
        countries: [],
        prices: [],
        rooms: [],
      },
      filteredHotels: [],
      errorApi: null,
      errors: {
        danger: {
          message: "Oops, no encontramos hotels. Volvé más tarde!",
          type: "danger",
        },
        warning: {
          message: "Mmmm, no encontramos hoteles. Probá otros filtros! ",
          type: "warning",
        },
      },
      isAllLoaded: false,
      title: "Hotels",
    };
  }
  generateOptions = () => {
    const { countries, prices } = this.state;

    const roomsFilter = [
      { value: null, name: "Cualquier tamaño" },
      { value: 10, name: "Hotel pequeño" },
      { value: 20, name: "Hotel mediano" },
      { value: 30, name: "Hotel grande" },
    ];

    const countriesFilter = countries.sort().map((country) => {
      return {
        name: country,
        value: country,
      };
    });
    const pricesFilter = prices.sort().map((price) => {
      return {
        value: price,
        name: "$".repeat(price),
      };
    });

    pricesFilter.unshift({ value: 0, name: "Cualquier precio" });
    countriesFilter.unshift({ value: 0, name: "Todos los países" });
    this.setState({
      options: {
        countries: countriesFilter,
        prices: pricesFilter,
        rooms: roomsFilter,
      },
    });
  };

  updateDateToLimits = () => {
    const { filters } = this.state;
    const dateTo = {
      min: Moment(filters.dateFrom).add(1, "day"),
      max: Moment(filters.dateFrom).add(1, "day").add(3, "month"),
    };
    this.setState((prevState) => ({
      dateLimits: {
        ...prevState.dateLimits,
        dateTo: dateTo,
      },
    }));
  };
  handleFilterChange = (payload) => {
    const { filters } = this.state;
    if (Moment(payload.dateFrom).isSameOrAfter(filters.dateTo)) {
      payload.dateTo = Moment(payload.dateFrom).add(1, "day");
    }
    this.setState({
      filters: payload,
    });
    this.updateDateToLimits();
    this.filterHotels();
  };
  filterHotels = () => {
    const { hotels, filters } = this.state;
    const newHotels = hotels.filter((hotel) => {
      return (
        Moment(hotel.availabilityFrom).isSameOrBefore(
          filters.dateFrom,
          "day"
        ) &&
        Moment(hotel.availabilityTo).isSameOrAfter(filters.dateTo, "day") &&
        (!filters.price || hotel.price === filters.price) &&
        (!filters.country || hotel.country === filters.country) &&
        (!filters.rooms || hotel.rooms <= filters.rooms)
      );
    });
    this.setState({
      filteredHotels: newHotels,
    });
  };
  componentDidMount() {
    this.updateDateToLimits();
    let timeOutError = false;
    const timeout = setTimeout(() => {
      timeOutError = true;
    }, 5000);
    fetch(
      "https://wt-8a099f3e7c73b2d17f4e018b6cfd6131-0.sandbox.auth0-extend.com/acamica"
    )
      .then((hotels) => {
        timeout && clearTimeout(timeout);
        if (!timeOutError) {
          return hotels.json();
        }
      })
      .then((hotels) => {
        const prices = [],
          countries = [];
        hotels.forEach((hotel) => {
          if (!prices.includes(hotel.price)) prices.push(hotel.price);
          if (!countries.includes(hotel.country)) countries.push(hotel.country);
        });
        this.setState({
          hotels: hotels,
          isAllLoaded: true,
          prices: prices,
          countries: countries,
          filteredHotels: hotels //Para que se vean los 18 hoteles al comienzo
        });
        //this.filterHotels(); Para que no se vean filtrados al cargar
        this.generateOptions();
      })
      .catch((e) => {
        timeout && clearTimeout(timeout);
        this.setState({
          errorApi: true,
        });
      });
  }

  render() {
    const {
      title,
      filters,
      filteredHotels,
      dateLimits,
      isAllLoaded,
      options,
      errors,
      errorApi,
    } = this.state;
    return (
      <div className="App">
        <Hero {...{ title, ...filters }} />
        <Filters
          {...{ filters, dateLimits, ...options }}
          onFilterChange={this.handleFilterChange}
        />
        <section className="section" style={{ marginTop: "1em" }}>
          <div className="container">
            {!isAllLoaded ? (
              !errorApi ? (
                <Loader />
              ) : (
                <Message {...errors.danger} />
              )
            ) : filteredHotels.length ? (
              <Hotels data={filteredHotels} />
            ) : (
              <Message {...errors.warning} />
            )}
          </div>
        </section>
      </div>
    );
  }
}

export default App;
