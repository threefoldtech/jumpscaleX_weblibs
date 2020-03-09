
module.exports = new Promise(async (resolve, reject) => {
  const vuex = await import("/weblibs/vuex/vuex.esm.browser.js");
  const { moment } = await import("/weblibs/moment/moment.min.js")
  const postService = await import("/services/postServices.js")

  resolve({
    name: "Feed",
    components: {
    },
    props: ['comment'],
    data() {
      return{
      }
    },
    computed: {
      formattedDate() {
        return moment(this.comment.created).format('LLL')
      }
    },
    methods: {
    },
  })
})
