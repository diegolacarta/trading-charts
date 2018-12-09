import {Component, h, Ref} from 'preact'

export default class Canvas extends Component<
  {
    innerRef: Ref<HTMLCanvasElement>
  } & JSX.HTMLAttributes
> {
  ratio = window.devicePixelRatio
  canvasContext: CanvasRenderingContext2D

  componentDidMount() {
    if (this.canvasContext.getTransform().a === this.ratio) {
      return
    }
    this.canvasContext.scale(this.ratio, this.ratio)
  }

  componentDidUpdate(prevProps) {
    if (this.props.height !== prevProps.height || this.props.width !== prevProps.width) {
      this.canvasContext.scale(this.ratio, this.ratio)
    }
  }

  onRef = (canvas: HTMLCanvasElement) => {
    if (canvas) {
      this.canvasContext = canvas.getContext('2d')
    }
    this.props.innerRef(canvas)
  }

  render() {
    const {innerRef, width, height, ...restProps} = this.props
    return (
      <canvas
        ref={this.onRef}
        width={Number(width) * this.ratio}
        height={Number(height) * this.ratio}
        style={{
          ...restProps.style,
          width: `${width}px`,
          height: `${height}px`
        }}
      />
    )
  }
}
