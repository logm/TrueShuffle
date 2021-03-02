import React from 'react'
// import { get, post, put } from '../js/httpRequests';
import { get, post } from '../js/httpRequests'


export class Main extends React.Component
{

	constructor (props)
	{
		super(props)
		this.getPlaylists = this.getPlaylists.bind(this)
		this.selectedPlaylist = this.selectedPlaylist.bind(this)
		this.state = {
			playlists: [],
			username: "loading",
			selectedPlaylists: new Set(),
			songs: new Set(),
		}
	}


	componentDidMount()
	{
		this.getPlaylists()
	}

	async getPlaylists()
	{
		console.log("getting playlists")

		let url = "	https://api.spotify.com/v1/me"
		let user = await get(url, null, null)
		url = "https://api.spotify.com/v1/me/playlists"
		let playlist = await get(url, null, null)
		this.setState({
			playlists: playlist.items,
			username: user.display_name,
		})
	}


	async selectedPlaylist(plid)
	{

		let url = "https://api.spotify.com/v1/playlists/" + plid
		let pl = await get(url, null, null)
		var tmp = []
		for (let song of pl.tracks.items)
		{
			tmp.push(song)
		}

		var tmpPlaylist = this.state.selectedPlaylists
		var tmpSongList = this.state.songs
		if (tmpPlaylist.has(plid))
		{
			tmpPlaylist.delete(plid)
			for (let s of tmpSongList)
			{
				for (let song of tmp)
				{
					if (s.id === song.id)
					{
						tmpSongList.delete(s)
					}
				}
			}
		} else
		{
			tmpPlaylist.add(plid)
			for (let song of tmp)
			{
				tmpSongList.add(song)
			}
		}
		this.setState({
			selectedPlaylists: tmpPlaylist,
			songs: tmpSongList
		})
	}


	render()
	{
		return (
			<div>
				<div className="container-fluid sticky-top mx-2 py-5 top-playlists">
					<h1>Hello { this.state.username }</h1>
					<div className="row playlists">
						{ this.state.playlists.length > 0 && <Playlists playlists={ this.state.playlists } selectedPlaylist={ this.selectedPlaylist } selectedPlaylistList={ this.state.selectedPlaylists } /> }
					</div>
				</div>
				<div className="container overflow-auto">
					<div className="row overflow-auto">
						<SongList songs={ this.state.songs } />
					</div>
				</div>
			</div>

		)
	}
}

export class Playlists extends React.Component
{
	constructor (props)
	{
		super(props)
	}


	render()
	{
		return (
			<div className="card-deck" id="playlist_list">
				{this.props.playlists.map((p) =>
				{
					return (
						<Playlist id={ p.id } name={ p.name } artwork={ p.images[0].url } total={ p.tracks.total } selectedPlaylist={ this.props.selectedPlaylist } />
					)
				}) }
			</div>
		)
	}
}


export class Playlist extends React.Component
{
	constructor (props)
	{
		super(props)
		this.handleClick = this.handleClick.bind(this)
		this.state = {
			active: false
		}
	}


	handleClick()
	{
		this.props.selectedPlaylist(this.props.id)
		this.setState({
			active: !this.state.active
		})
	}
	render()
	{

		return (
			<a className={ `card card-block playlist_card  col-4 col-sm-4 col-md-3 col-lg-2 col-xxl-1 text-truncate ${this.state.active ? "playlist_card_active" : "playlist_card_inactive"}` } id={ this.props.id } href="#" onClick={ this.handleClick }>
				<img src={ this.props.artwork } className="card-img-top border-0" alt="..." />
				<div className="card-body">
					<h5 className="card-title">{ this.props.name }</h5>
					<p className="card-text">
						<span className="badge badge-pill badge-secondary">{ this.props.total }</span>
					</p>
				</div>
			</a>
		)

	}
}

export class SongList extends React.Component
{
	constructor (props)
	{
		super(props)
	}
	render()
	{
		return (
			<div className="col-sm overflow-auto" id="selected_song_list">
				{Array.from(this.props.songs).map((s) =>
				{
					return (
						<Song name={ s.track.name } id={ s.track.id } is_local={ s.track.is_local } />
					)
				}) }
			</div>
		)
	}
}

export class Song extends React.Component
{
	constructor (props)
	{
		super(props)
		this.handleClick = this.handleClick.bind(this)
	}

	handleClick()
	{
		if (this.props.is_local)
		{
			console.log("trying to play local song, spotify does not support that yet :(")
			return
		} else
		{
			let url = "https://api.spotify.com/v1/me/player/queue"
			url += '?uri=spotify%3Atrack%3A' + this.props.id
			post(url, null, null)
		}
	}
	render()
	{
		return (
			<a className="list-group-item list-group-item-action" id={ this.props.is_local ? "sn-null" : "" } href="#" onClick={ this.handleClick }>{ this.props.name }</a>

		)

	}
}