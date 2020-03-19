
module.exports = new Promise(async (resolve, reject) => {
  const vuex = await import("/weblibs/vuex/vuex.esm.browser.js");
  const { moment } = await import("/weblibs/moment/moment.min.js")

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
      ...vuex.mapGetters([
        "user"
      ]),
      formattedDate() {
        return moment.unix((this.comment.created)).format('LLL')
      },
      likeBalance() {
        return this.comment.likeCount - this.comment.dislikeCount
      }
    },
    methods: {
      ...vuex.mapActions([
        "addVote"
      ]),
      submitVote (vote) {
        this.addVote({
          post_id: this.comment.id,
          vote: {
            type: vote,
            user: this.user.id
          }
        })
        console.log("voting ...", vote)
      }
    },
  })
})
