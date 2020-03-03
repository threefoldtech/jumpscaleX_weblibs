module.exports = {
  name: 'nodeinfo',
  props: ['node'],
  data () {
    return {
    }
  },
  mounted() {
    console.log(this.node)
  },
  methods: {
    getPercentage(type) {
      return (this.node.usedResources[type] / this.node.totalResources[type]) * 100
    }
  }
}
