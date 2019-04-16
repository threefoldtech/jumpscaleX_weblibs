/*
 * Copyright 2017 ThreeFold Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @@license_version:1.3@@
 */

function TeamWidgetService() {
}

TeamWidgetService.prototype = {
    get_member_template: function(member) {
        return `
            <div class="rj-team-member">
                <div class="member-photo"><img class="rj-team-member-photo-rollover"
                        src="${member.avatar}"></div>
                <div class="rj-team-member-info-text" style="display: none;">
                    <div class="row">
                        <div class="col-sm-4"><img src="${member.avatar}"></div>
                        <div class="col-sm-8">
                            <div class="member-name">${member.full_name}r</div>
                            <div class="bio-excerpt">${member.description}</div>
                        </div>
                        <div class="close-bio">x</div>
                    </div>
                </div>
            </div>
            `
    },

    get_team_template: function(members) {
        var self = this;
        var member_templates = $.map(members, function(member) {
            return self.get_member_template(member)
        });

        return `
            <div class="team">
                <div class="rj-team">
                    ${ member_templates.join('\n') }
                </div>
            </div>
        `
    },

    shuffle: function(dataset) {
        // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
        var j, x, i;
        for (i = dataset.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = dataset[i];
            dataset[i] = dataset[j];
            dataset[j] = x;
        }
        return dataset;
    },

    sort: function(dataset, prop, defaultValue) {
        function setDefaultValue(member) {
            // 0 means unset too
            if (!member[prop]) {
                member[prop] = defaultValue;
            }
        }

        return dataset.sort(function(memberA, memberB) {
            setDefaultValue(memberA);
            setDefaultValue(memberB);

            return memberA[prop] > memberB[prop];
        });
    },

    render: function (dataset, order) {
        order = order.toLowerCase();
        if (order === 'random') {
            dataset = this.shuffle(dataset);
        } else if (order === 'rank') {
            lowestRank = dataset.length + 1;
            dataset = this.sort(dataset, 'rank', lowestRank);
        } else {
            throw Error('order should be "random" or "rank"');
        }
        return this.get_team_template(dataset);
    },

    setupHandlers: function() {
        // toggle bio handlers
        $(document).on("click", ".rj-team-member .member-photo", function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(this).parent().siblings().children(".member-photo").removeClass("selected"), $(this).toggleClass("selected"), $(this).parent().siblings().children(".rj-team-member-info-text").hide(), $(this).siblings(".rj-team-member-info-text").toggle();
            var a = $(this).siblings(".rj-team-member-info-text").offset();
            $("body").animate({
                scrollTop: a
            }), $(".close-bio").click(function () {
                $(this).parent().siblings(".member-photo").removeClass("selected"), $(this).parent(".rj-team-member-info-text").hide()
            })
        });

        // activate team filter
        $("#teamFilterText").prop("disabled", !1)
        $(document).on("input", "#teamFilterText", function () {
            var a = $("#teamFilterText").val();
            "" == a ? $(".rj-team-member").show() : ($(".rj-team-member").hide(), $(".rj-team-member:Contains('" + a + "')").show())
        });

        // unselect div
        $(document).click(function (a) {
            $(a.target).closest(".rj-team-member .member-photo").length || $(".rj-team-member .member-photo").is(":visible") && ($(".rj-team-member-info-text").hide(), $(".member-photo").removeClass("selected"))
        });
    },
};


var TeamWidget = new TeamWidgetService();
