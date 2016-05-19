describe('Canvas-based elements', () => {

  describe('Helper functions', () => {
    let c

    beforeEach(() => {
      // Reset screen
      c = new lab.CanvasScreen(
        () => null, // dummy drawing function
        {
          el: document.createElement('div')
        }
      )
    })

    it('Inserts a canvas into the page if necessary', () => {
      // Run the CanvasScreen
      const p = c.go()
      c.end()

      // Tests
      return p.then(() => {
        // Check whether a canvas has been
        // inserted into the page
        const canvas = c.el.getElementsByTagName('canvas')[0]
        assert.ok(canvas)
        assert.equal(canvas, c.canvas)
      })
    })

    it('Does not insert a canvas if provided with one', () => {
      // Specify a canvas for the CanvasScreen
      c.canvas = document.createElement('canvas')

      const p = c.go()
      c.end()

      // Tests
      return p.then(() => {
        // The element should be empty
        assert.equal(
          c.el.getElementsByTagName('canvas').length,
          0
        )
      })
    })

    it('Sets canvas width and height correctly', () => {
      // Set dimensions on the surrounding element
      c.el.style.height = '200px'
      c.el.style.width = '300px'

      const p = c.go()
      c.end()

      // Tests
      return p.then(() => {
        assert.equal(
          c.canvas.height,
          c.el.clientHeight,
          'canvas height set correctly'
        )
        assert.equal(
          c.canvas.width,
          c.el.clientWidth,
          'canvas width set correctly'
        )
      })
    })
  })

  describe('CanvasScreen', () => {
    it('Binds render function to element')
    it('Selects 2d canvas context by default')
    it('Executes render function to draw on element when run')
  })

  describe('CanvasSequence', () => {
    it('Adds canvas to hand-me-downs')
    it('Complains if any nested elements are not CanvasScreens')
    it('Runs canvas drawing operations in sequence')
  })
})
