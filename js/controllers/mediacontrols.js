/**
 * Creates a visual multimedia controls for the background video presentation.
 */
export default class MediaControls {

	fastForwardIcons = {
		undefined: 'mdi-fast-forward',
		'default': 'mdi-fast-forward',
		5: 'mdi-fast-forward-5',
		10: 'mdi-fast-forward-10',
		15: 'mdi-fast-forward-15',
		30: 'mdi-fast-forward-30',
		45: 'mdi-fast-forward-45',
		60: 'mdi-fast-forward-60',
	};

	rewindIcons = {
		undefined: 'mdi-rewind',
		'default': 'mdi-rewind',
		5: 'mdi-rewind-5',
		10: 'mdi-rewind-10',
		15: 'mdi-rewind-15',
		30: 'mdi-rewind-30',
		45: 'mdi-rewind-45',
		60: 'mdi-rewind-60',
	};

	controls = {
		'play': {
			'icon': { 'lib': 'mdi-play' },
			'action': [ { 'name': 'click', 'func': this.onClickPlay } ],
		},
		'skipPrevious': {
			'icon': { 'lib': 'mdi-skip-previous' },
			'action': [ { 'name': 'click', 'func': this.onClickSkipPrev } ],
		},
		'rewind': {
			'icon': { 'lib': this.rewindIcons, 'param': 'step' },
			'action': [ { 'name': 'click', 'func': this.onClickRewind } ],
		},
		'fastForward': {
			'icon': { 'lib': this.fastForwardIcons, 'param': 'step' },
			'action': [ { 'name': 'click', 'func': this.onClickFastForward } ],
		}
	}

	defaults = {
		'step': 5,
		'controls' : this.controls,
	};

	constructor( Reveal ) {

		this.Reveal = Reveal;

		this.media = [];
		this.config = {};
		Object.entries(this.defaults).forEach((e, i, a) => {
			let [key, value] = e;
			this.config[ key ] = value;
		});

	}

	configure( config, oldConfig ) {

		if ( config.mediacontrols ) {
			Object.entries(config.mediacontrols).forEach((e, i, a) => {
				let [key, value] = e;
				this.config[ key ] = value || this.defaults[ key ];
			});
		}


		Object.entries(this.config.controls).forEach((e, i, a) => {
			let [key, value] = e;
			value.element = this.createButton( key, value.action );
			this.removeIcon( value.element );
			let icon = this.createIcon( value.icon.lib, this.config[ value.icon.param ] );
			value.element.appendChild( icon );
		});

	}

	render() {

		this.element = document.createElement( 'div' );
		this.element.id = 'mediacontrols';
		this.element.classList.add( 'mediacontrols' );
		this.Reveal.getRevealElement().appendChild( this.element );

	}

	getConfig() {
		return this.config;
	}

	createButton( id, action ) {

		this.element.querySelectorAll( 'button#' + id ).forEach((e, i, a) => {
			e.parentNode.removeChild( e );
		});

		let button = document.createElement( 'button' );
		button.id = id;
		action.forEach((e, i, a) => {
			button.addEventListener( e.name, e.func.bind( this ), false);
		});

		this.element.appendChild( button );

		return button;

	}

	removeIcon( button ) {

		if ( button !== undefined ) {
			button.querySelectorAll( 'i' ).forEach((e, i, a) => {
				e.parentNode.removeChild( e );
			});
		}

	}

	createIcon( def, param ) {
		
		let icon = document.createElement( 'i' );
		icon.classList.add( 'mdi' );

		if ( typeof def === 'string' ) {
			icon.classList.add( def );
		} else {
		let name = def.hasOwnProperty( param ) ?
		    def[ param ] : param[ 'default' ];
			icon.classList.add( name );
		}

		return icon;

	}

	attach( element ) {

		if ( this.media.indexOf( element ) > -1 )
			return;

		this.media.push( element );

		element.addEventListener( 'play', this.onMediaEvent.bind( this ), false );
		element.addEventListener( 'pause', this.onMediaEvent.bind( this ), false );
		element.addEventListener( 'ended', this.onMediaEvent.bind( this ), false );

		this.visibilityToggle();

	}

	detach( element ) {

		element.removeEventListener( 'play', this.onMediaEvent.bind( this ), false );
		element.removeEventListener( 'pause', this.onMediaEvent.bind( this ), false );
		element.removeEventListener( 'ended', this.onMediaEvent.bind( this ), false );

		let index = this.media.indexOf( element );
		if (index > -1)
			this.media.splice( index, 1 );

		this.visibilityToggle();

	}

	visibilityToggle() {

		if ( this.media.length > 0)
			this.element.classList.add( 'visible' );
		else
			this.element.classList.remove( 'visible' );

	}

	getDefaultControlNames() {
		return Object.keys( this.controls );
	}

	getDefaultControl( name ) {
		return this.controls[ name ];
	}

	onClickPlay( event ) {

		this.media.forEach((e, i, a) => {
			if ( e.paused ) {

				e.play();

			} else {

				e.pause();

			}
		});

	}

	onClickFastForward( event ) {

		let step = this.config.step;

		this.media.forEach((e, i, a) => {

			let currentTime = e.duration - e.currentTime > step ? e.currentTime + step : e.duration;
			e.currentTime = currentTime;

		});

	}

	onClickRewind( event ) {

		let step = this.config.step;

		this.media.forEach((e, i, a) => {

			let currentTime = e.currentTime > step ? e.currentTime - step : 0;
			e.currentTime = currentTime;

		});

	}

	onClickSkipPrev( event ) {

		this.media.forEach((e, i, a) => {

			e.currentTime = 0;

		});

	}

	onMediaEvent( event ) {

		let paused = this.media.every((e, i, a) => {
			return e.paused || e.ended;
		});

		if ( paused ) {

			this.controls.play.element.querySelector( 'i' ).classList.remove( 'mdi-pause' );
			this.controls.play.element.querySelector( 'i' ).classList.add( 'mdi-play' );

		} else {

			this.controls.play.element.querySelector( 'i' ).classList.remove( 'mdi-play' );
			this.controls.play.element.querySelector( 'i' ).classList.add( 'mdi-pause' );

		}
	}
}
