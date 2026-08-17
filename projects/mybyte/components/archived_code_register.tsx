/*

@ -692,158 +692,8 @@ export default function Register() {
                              )}
                            </div>
                          </div>
                          <div className="w-full md:w-full px-3 mb-6">
                            <Controller
                              control={control}
                              name="codeOfConduct"
                              rules={{
                                required:
                                  "Please indicate you have read and agreed to the MLH code of conduct",
                              }}
                              render={({ field: { onChange, value } }) => (
                                <>
                                  <label
                                    className="block tracking-wide text-gray-700 text-xs font-bold mb-2"
                                    htmlFor="grid-text-1"
                                  >
                                    <em>MLH Code of Conduct: </em>&quot;I have
                                    read and agree to the{" "}
                                    <Link
                                      href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
                                      target="_blank"
                                      className="text-blue-600"
                                    >
                                      MLH Code of Conduct
                                    </Link>
                                    .&quot;
                                    <span className="text-red-600">*</span>
                                  </label>
                                  <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      value=""
                                      id="grid-text-1"
                                      className="sr-only peer"
                                      onChange={() => {
                                        onChange(!value);
                                      }}
                                      checked={!!value}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                  </label>
                                </>
                              )}
                            />
                            {errors.codeOfConduct && (
                              <p className={errorStyles}>
                                {errors.codeOfConduct.message}
                              </p>
                            )}
                          </div>
                          <div className="w-full md:w-full px-3 mb-6">
                            <Controller
                              control={control}
                              name="eventLogisticsInfo"
                              rules={{
                                required:
                                  "Please indicate you have read and agree to the MLH Privacy policy",
                              }}
                              render={({ field: { onChange, value } }) => (
                                <>
                                  <label
                                    className="block tracking-wide text-gray-700 text-xs font-bold mb-2"
                                    htmlFor="grid-text-1"
                                  >
                                    <em>Event Logistics Information: </em>“I
                                    authorize you to share my
                                    application/registration information with
                                    Major League Hacking for event
                                    administration, ranking, and MLH
                                    administration in-line with the{" "}
                                    <Link
                                      href="https://mlh.io/privacy"
                                      target="_blank"
                                      className="text-blue-600"
                                    >
                                      MLH Privacy Policy
                                    </Link>
                                    . I further agree to the terms of both the{" "}
                                    <Link
                                      href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
                                      target="_blank"
                                      className="text-blue-600"
                                    >
                                      MLH Contest Terms and Conditions
                                    </Link>{" "}
                                    and the{" "}
                                    <Link
                                      href="https://mlh.io/privacy"
                                      target="_blank"
                                      className="text-blue-600"
                                    >
                                      MLH Privacy Policy
                                    </Link>
                                    .”<span className="text-red-600">*</span>
                                  </label>
                                  <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      value=""
                                      id="grid-text-1"
                                      className="sr-only peer"
                                      onChange={() => {
                                        onChange(!value);
                                      }}
                                      checked={!!value}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                  </label>
                                </>
                              )}
                            />
                            {errors.eventLogisticsInfo && (
                              <p className={errorStyles}>
                                {errors.eventLogisticsInfo.message}
                              </p>
                            )}
                          </div>
                          <div className="w-full md:w-full px-3 mb-6">
                            <Controller
                              control={control}
                              name="mlhCommunication"
                              render={({ field: { onChange, value } }) => (
                                <>
                                  <label
                                    className="block tracking-wide text-gray-700 text-xs font-bold mb-2"
                                    htmlFor="grid-text-1"
                                  >
                                    <em>Communication from MLH: </em>“I
                                    authorize MLH to send me occasional emails
                                    about relevant events, career opportunities,
                                    and community announcements.&quot;
                                  </label>
                                  <label className="relative inline-flex items-center mb-4 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      value=""
                                      id="grid-text-1"
                                      className="sr-only peer"
                                      onChange={() => {
                                        onChange(!value);
                                      }}
                                      checked={!!value}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-300 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                  </label>
                                </>
                              )}
                            />
                            {errors.mlhCommunication && (
                              <p className={errorStyles}>
                                {errors.mlhCommunication.message}
                              </p>
                            )}
                          </div>


                          <div className={!shouldRender ? "pb-56" : "pb-20"}>
                            {submitError && (
                              <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
</p>

*/