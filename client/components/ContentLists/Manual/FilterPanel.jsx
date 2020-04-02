import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";

import MultiSelect from "../../UI/MultiSelect";

class FilterPanel extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      filters: { route: [], author: [] },
      routes: [],
      authors: []
    };
  }

  componentDidMount() {
    this._isMounted = true;

    this.props.publisher.queryRoutes({ type: "collection" }).then(routes => {
      if (this._isMounted) {
        this.setState({ routes }, this.prepareFilters);
      }
    });

    this.loadAuthors();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  loadAuthors = (page = 1) => {
    this.props.api.users
      .query({
        max_results: 200,
        page: page,
        sort: '[("first_name", 1), ("last_name", 1)]',
        where: {
          is_support: { $ne: true }
        }
      })
      .then(response => {
        let authors = response._items.filter(item => item.is_author);

        if (this._isMounted && authors.length)
          this.setState({ authors: [...this.state.authors, ...authors] });

        if (response._links.next) this.loadAuthors(page + 1);
      });
  };

  handleAuthorChange = arr => {
    let filters = { ...this.state.filters };

    filters.author = arr ? arr : [];
    this.setState({ filters });
  };

  handleRoutesChange = arr => {
    let filters = { ...this.state.filters };

    filters.route = arr ? arr : [];
    this.setState({ filters });
  };

  handleInputChange = (e, a) => {
    let { name, value } = e.target;
    let filters = { ...this.state.filters };

    filters[name] = value;
    this.setState({ filters });
  };

  clear = () => {
    this.setState({ filters: { route: [], author: [] } }, this.save);
  };

  save = () => {
    let filters = _.pickBy({ ...this.state.filters }, _.identity);

    if (this.state.filters.author.length) {
      delete filters.author;
      filters["author[]"] = [];
      this.state.filters.author.map(item => {
        filters["author[]"].push(item.value);
      });
    }

    if (this.state.filters.route.length) {
      delete filters.route;
      filters["route[]"] = [];
      this.state.filters.route.map(item => {
        filters["route[]"].push(item.value);
      });
    }

    this.props.filter(filters);
  };

  render() {
    let routesOptions = [];

    this.state.routes.map(route => {
      routesOptions.push({
        value: parseInt(route.id),
        label: route.name
      });
    });

    let authorsOptions = [];

    this.state.authors.map(author => {
      authorsOptions.push({
        value: author.display_name,
        label: author.display_name
      });
    });

    return (
      <div className="sd-filters-panel sd-filters-panel--border-left">
        <div className="side-panel side-panel--transparent side-panel--shadow-right">
          <div className="side-panel__header side-panel__header--border-b">
            <a
              className="icn-btn side-panel__close"
              sd-tooltip="Close filters"
              flow="left"
              onClick={this.props.toggle}
            >
              <i className="icon-close-small" />
            </a>
            <h3 className="side-panel__heading">Advanced filters</h3>
          </div>
          <div className="side-panel__content">
            <div className="side-panel__content-block">
              <div className="form__row">
                <div className="sd-line-input sd-line-input--no-margin sd-line-input--with-button">
                  <label className="sd-line-input__label">Categories</label>
                  <MultiSelect
                    onSelect={values => this.handleRoutesChange(values)}
                    options={routesOptions}
                    selectedOptions={this.state.filters.route}
                  />
                </div>
              </div>
              <div className="form__row">
                <div className="sd-line-input sd-line-input--no-margin sd-line-input--with-button">
                  <label className="sd-line-input__label">Author</label>
                  <MultiSelect
                    onSelect={values => this.handleAuthorChange(values)}
                    options={authorsOptions}
                    selectedOptions={this.state.filters.author}
                  />
                </div>
              </div>
              <div className="form__row form__row--flex">
                <div className="sd-line-input sd-line-input--no-margin">
                  <label className="sd-line-input__label">Published date</label>
                  <input
                    className="sd-line-input__input"
                    type="date"
                    onChange={this.handleInputChange}
                    name="published_at"
                    value={
                      this.state.filters.published_at
                        ? this.state.filters.published_at
                        : ""
                    }
                  />
                </div>
              </div>
              <div className="form__row form__row--flex">
                <div className="sd-line-input sd-line-input--no-margin">
                  <label className="sd-line-input__label">
                    Published after
                  </label>
                  <input
                    className="sd-line-input__input"
                    type="date"
                    onChange={this.handleInputChange}
                    name="published_after"
                    value={
                      this.state.filters.published_after
                        ? this.state.filters.published_after
                        : ""
                    }
                  />
                </div>
              </div>
              <div className="form__row form__row--flex">
                <div className="sd-line-input sd-line-input--no-margin">
                  <label className="sd-line-input__label">
                    Published before
                  </label>
                  <input
                    className="sd-line-input__input"
                    type="date"
                    onChange={this.handleInputChange}
                    name="published_before"
                    value={
                      this.state.filters.published_before
                        ? this.state.filters.published_before
                        : ""
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="side-panel__footer side-panel__footer--button-box">
            <div className="flex-grid flex-grid--boxed-small flex-grid--small-2">
              <a className="btn btn--hollow" onClick={this.clear}>
                Clear
              </a>
              <a className="btn btn--primary" onClick={this.save}>
                Filter
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

FilterPanel.propTypes = {
  filter: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  publisher: PropTypes.object.isRequired,
  api: PropTypes.func.isRequired
};

export default FilterPanel;
