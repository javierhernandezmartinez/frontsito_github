import React from "react";
import {ApolloClient, InMemoryCache, gql} from "@apollo/client";
import {FaGithub} from 'react-icons/fa';
import {white} from "tailwindcss/colors";

export default class Buscador extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedOption: "Search...",
            inputValue: "",
            mensage: "",
            DatUsers: [],
            userSelected: [],
            showModal: false
        }
    }

    conectionApollo = () => {
        return new ApolloClient({
            uri: 'https://api.github.com/graphql',
            cache: new InMemoryCache(),
            headers: {Authorization: 'Bearer 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'}
        });
    }

    getApolloData = () => {
        console.log("searching:::", this.state.inputValue)
        this.conectionApollo().query({
            variables: {
                "query": this.state.inputValue,
                "first": 10
            },
            query: gql`
                query SearchUsers($query: String!, $first: Int!) {
                    search(query: $query, type: USER, first: $first) {
                        edges{
                            node{
                                ... on User{
                                    login
                                    name
                                    bio
                                    websiteUrl
                                    email
                                    avatarUrl
                                    url
                                }
                            }
                        }
                    }                    
                }`
        }).then(result => {
                console.log(result.data.search.edges)
                this.setState({DataUsers: result.data.search.edges})
            }
        );
    }

    onChangeSelect = (event) => {
        this.setState({selectedOption: event.target.value})
    }

    onChangeInput = (event) => {
        this.setState({inputValue: event.target.value})
    }

    Select = ({placeholderText}) => {
        return (
            <select id={"select1"} className={"w-full h-10 rounded-md"} onChange={this.onChangeSelect.bind(this)}>
                <option hidden={true} selected={true}>{placeholderText}</option>
                <option>Login</option>
                <option>Nombre</option>
                <option>Email</option>
            </select>
        )
    }

    Input = ({placeholderText}) => {
        return (
            <>
                <input id={"input1"} className={"w-full h-10 rounded-md"}
                       placeholder={placeholderText}
                       onChange={this.onChangeInput.bind(this)}
                />
                <p className={"w-full h-14 text-white rounded-md"}>
                    {this.state.mensage}
                </p>
            </>

        )
    }

    SubmitButton = () => {
        return (
            <button className={"w-full h-10 rounded-md bg-blue-400 text-white font-medium hover:bg-blue-500"}
                    onClick={() => this.validateInput()}
            >
                Search
            </button>
        )
    }

    UserProfileCard = () => {
        if (this.state.DataUsers?.length >= 1) {
            return (
                <div className={"grid grid-cols-12 gap-4"}>
                    {
                        this.state.DataUsers?.map(
                            row => (

                                    <div
                                        className={"col-span-12 bg-white rounded-md h-auto w-full p-4 sm:col-span-6 md:col-span-6 lg:col-span-4"}>
                                        <div className={"row-span-1"}>
                                            <div className={"grid grid-cols-12"}>
                                                <div className={"col-span-4"}>
                                                    <img className={"m-auto min-w-full rounded-md h-full object-cover"}
                                                         src={row.node.avatarUrl}
                                                    />
                                                </div>
                                                <div className={"col-span-8"}>
                                                    <div className={"grid grid-rows-1 h-full"}>
                                                        <p className={"text-gray-700 p-2 text-left text-sm font-medium"}>
                                                            {row.node.name}
                                                        </p>
                                                        <p className={"text-gray-700 p-2 text-left text-sm"}>
                                                            <span className={"font-medium"}>Login:</span> {row.node.login}
                                                        </p>
                                                        <p className={"text-gray-700 p-2 text-left text-sm"}>
                                                            <span className={"font-medium"}>Email:</span> {row.node.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={"row-span-1"}>
                                            <div className={"col-span-12"}>
                                                <p className={"m-auto mt-3 text-blue-500 rounded-md hover:text-purple-900 hover:underline cursor-pointer"}
                                                   onClick={() => {
                                                       this.setState({userSelected: row, showModal: true})
                                                   }}
                                                >
                                                    Ver mas ...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                            )
                        )
                    }
                </div>

            )
        } else {
            return (
                <div className={"grid grid-cols-12 gap-4 h-full"}>
                    <p className={"text-white text-2xl w-full m-auto font-medium col-span-12 flex justify-center h-full items-center"}>
                        No existen usuarios
                    </p>
                </div>
            )
        }
    }

    validateInput = () => {
        if (this.state.selectedOption !== "Search...") {
            document.getElementById("select1").classList.remove("bg-red-200", "border-2", "border-red-600")
            if (this.state.selectedOption !== "Email") {
                if (this.state.inputValue.length >= 3) {
                    this.setState({mensage: ""})
                    this.getApolloData()
                    document.getElementById("input1").classList.remove("bg-red-200", "border-2", "border-red-600")

                } else {
                    this.setState({mensage: "Requerido minimo 3 caracteres"})
                    document.getElementById("input1").classList.add("bg-red-200", "border-2", "border-red-600")
                }
            } else {
                let emailOK = this.validateEmail(this.state.inputValue)
                if (emailOK) {
                    this.getApolloData()
                    this.setState({mensage: ""})
                    document.getElementById("input1").classList.remove("bg-red-200", "border-2", "border-red-600")
                } else {
                    this.setState({mensage: "Requerido acepta solo formato de correo electrónico válido"})
                    document.getElementById("input1").classList.add("bg-red-200", "border-2", "border-red-600")
                }
            }
        } else {
            this.setState({mensage: "Seleccione una opcion de busqueda"})
            document.getElementById("select1").classList.add("bg-red-200", "border-2", "border-red-600")
        }
    }

    validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    Modal = () => {
        return (
            <>
                {
                    this.state.showModal ?
                        <div className={"absolute w-full h-screen bg-blue-500 bg-opacity-30 top-0"}>
                            <div className={"flex w-full h-full m-auto justify-center align-middle"}>
                                <div className={"m-auto bg-white w-5/6 sm:w-2/3 md:w-1/2 rounded-md p-2"}>
                                    <div
                                        className={"col-span-12 bg-white rounded-md h-auto w-full p-4 sm:col-span-6 md:col-span-6 lg:col-span-4"}>
                                        <div className={"row-span-1"}>
                                            <div className={"grid grid-cols-12"}>
                                                <div
                                                    className={"col-span-12 sm:col-span-4 md:col-span-4 lg:col-span-5"}>
                                                    <img className={"m-auto w-40 rounded-full h-40 object-cover"}
                                                         src={this.state.userSelected.node.avatarUrl}
                                                    />
                                                    <p className={"text-gray-700 p-2 text-center text-sm font-medium"}>
                                                        {this.state.userSelected.node.name}
                                                    </p>
                                                </div>
                                                <div className={"col-span-12 sm:col-span-6 md:col-span-6"}>
                                                    <div className={"grid grid-rows-1 h-full"}>
                                                        <p className={"text-gray-700 p-2 text-left text-sm font-medium"}>
                                                            {this.state.userSelected.node.bio}
                                                        </p>
                                                        <p className={"text-gray-700 p-2 text-left text-sm"}>
                                                            <span className={"font-medium mr-2"}>Login:</span>
                                                            {this.state.userSelected.node.login}
                                                        </p>
                                                        <p className={"text-gray-700 p-2 text-left text-sm"}>
                                                            <span className={"font-medium mr-2"}>Email:</span>
                                                            {this.state.userSelected.node.email}
                                                        </p>
                                                        <p className={"text-gray-700 p-2 text-left text-sm font-medium"}>
                                                            Sitios:
                                                        </p>
                                                        <p className={"text-gray-700 p-2 text-left text-sm p-2"}>
                                                            {this.rowWebSite(this.state.userSelected.node.websiteUrl)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={""}>
                                        <div className={"col-span-12"}>
                                            <p>Ir a perfil de GitHub:
                                                <span
                                                    className={"text-gray-700 underline cursor-pointer hover:text-blue-500 ml-2"}
                                                    onClick={() => {
                                                        window.open(this.state.userSelected.node.url, '_blank')
                                                    }}
                                                >
                                                    { this.state.userSelected.node.email}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className={"flex "}>
                                        <p className={"m-auto mr-0 bg-blue-500 opacity-60 text-white w-1/5 h-10 rounded-md flex align-middle place-items-center justify-center hover:opacity-90 sm:w-full"}
                                           onClick={() => {
                                               this.setState({showModal: false})
                                           }}
                                        >Cerrar</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        : null
                }
            </>
        )
    }

    rowWebSite = (row) => {
        if (row !== null) {
            let sites = row.split(",")
            if (sites.length > 1) {
                return (
                    <>
                        {
                            sites.map(
                                (site) => (
                                    <li className={"cursor-pointer hover:underline hover:text-blue-500"}
                                       onClick={() => {
                                           window.open(site.indexOf("http") !== -1 ? site : "http://" + site, '_blank')
                                       }}
                                    >
                                        {site.indexOf("http") !== -1 ? site : "http://" + site}
                                    </li>
                                )
                            )
                        }
                    </>)
            } else {
                return (
                    <li className={"cursor-pointer hover:underline hover:text-blue-500"}
                       onClick={() => {
                           window.open(row.indexOf("http") !== -1 ? row : "http://" + row, '_blank')
                       }}
                    >
                        {row.indexOf("http") !== -1 ? row : "http://" + row}
                    </li>
                )
            }
        } else {
            return (<></>)
        }
    }

    render() {
        return (
            <div className="w-full h-screen bg-gray-700 overflow-auto">
                <div className={"grid h-full"}>
                    <div className={"row-span-1"}>
                        <div className={"grid col-span-12 h-full "}>
                            <p className={"text-white m-auto text-2xl font-medium"}>
                                Buscador de usuarios GitHub
                            </p>
                        </div>
                    </div>
                    <div className={"row-span-1"}>
                        <div className={"grid grid-cols-12 gap-4 w-full h-full sm:grid-cols-1 md:grid-cols-12"}>
                            <div className={"col-span-12 sm:col-span-6 m-auto w-full md:col-span-4 lg:col-span-3"}>
                                <div className={"row-span-1 h-auto m-4"}>
                                    <div className={"col-span-12"}>
                                        <div className={"w-auto grid justify-center"}>
                                            <FaGithub size={50} color={white}/>
                                        </div>
                                    </div>
                                </div>
                                <div className={"row-span-1 h-auto m-4"}>
                                    <div className={"col-span-12"}>
                                        <this.Select placeholderText={"Search by"}/>
                                    </div>
                                </div>
                                <div className={"row-span-1 h-auto m-4"}>
                                    <div className={"col-span-12"}>
                                        <this.Input placeholderText={this.state.selectedOption}/>
                                    </div>
                                </div>
                                <div className={"row-span-1 h-auto m-4"}>
                                    <div className={"col-span-12"}>
                                        <this.SubmitButton/>
                                    </div>
                                </div>
                            </div>
                            <div className={"col-span-12 m-4 h-full sm:col-span-6 md:col-span-8 lg:col-span-9"}>
                                <div className={"row-span-1 gap-4 bg-black bg-opacity-20 w-full h-full rounded-md"}>
                                    <this.UserProfileCard/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"row-span-1"}>
                    </div>
                </div>
                <this.Modal/>
            </div>
        )
    }
}